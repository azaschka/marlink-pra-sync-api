/*
 * Shared service for discrepancy scanning logic.
 * Contains common operations for both entity and entity-relation discrepancy scanning.
 * Uses Strategy Pattern to handle different entity types dynamically.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { differenceBy, differenceWith, intersectionBy, intersectionWith, isEqual } from 'lodash';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { DateUtility, ObjectUtility, PaginationUtility, RetryUtility } from '../../shared/utilities';
import { DiscrepancyStrategy } from '../types/discrepancy-strategy.type';

/**
 * Result of fetching and transforming data from BeyondTrust API
 */
export interface FetchedData<T = any> {
    raw: T[];
    transformed: any[];
}

/**
 * Result of discrepancy analysis comparing BeyondTrust and database data
 */
export interface DiscrepancyAnalysis<T = any> {
    identical: T[];
    onlyInBt: T[];
    onlyInDb: T[];
    differentPairs: Array<{ bt: T; db: T }>;
}

@Injectable()
export class DiscrepancyScannerService {
    private static readonly DELAY_BETWEEN_CALLS_MS = 10;

    constructor(private readonly appConfigService: AppConfigService) {}

    /**
     * Fetch data from BeyondTrust API with pagination.
     * Pages are not retried here: HttpClientService owns the only retry layer for BeyondTrust calls.
     */
    public async fetchFromBeyondTrust<T>(
        discrepancyStrategy: DiscrepancyStrategy<unknown, unknown, unknown>,
        transactionId: string,
        tenantId: number,
        entityType: string,
    ): Promise<FetchedData<T>> {
        console.log(`📡 Attempting BeyondTrust API call for ${entityType}...`);

        await RetryUtility.delay(DiscrepancyScannerService.DELAY_BETWEEN_CALLS_MS);

        const rawData = await PaginationUtility.queryUntilDuplicatePage(
            async (pageNumber: number) =>
                (await discrepancyStrategy.btRetrieveFunc(
                    transactionId,
                    tenantId,
                    this.appConfigService.discrepancy.maxBatchSize,
                    pageNumber,
                )) as object[],
            discrepancyStrategy.btOmittedPropsForDuplicateCheck,
        );

        console.log(`✅ BeyondTrust API successful for ${entityType}, received ${rawData.length} records`);

        const transformed = rawData
            .map((btData: any) => discrepancyStrategy.btToDbEntity(btData))
            .map((data: any) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
            .map((data: any) => JSON.parse(JSON.stringify(data))); // Remove undefined values

        return { raw: rawData as T[], transformed };
    }

    /**
     * Fetch the relations of one parent from BeyondTrust.
     * Every failure propagates, including 404: an empty list is only returned when BeyondTrust returned one.
     * Treating an error (for example an HTML 404 from a proxy) as "no relations" made every relation look
     * "only in DB" and let auto-sync delete them locally.
     */
    public async fetchFromBeyondTrustWithErrorHandling<T>(
        discrepancyStrategy: DiscrepancyStrategy<unknown, unknown, unknown>,
        transactionId: string,
        tenantId: number,
    ): Promise<FetchedData<T>> {
        const rawData = await PaginationUtility.queryUntilDuplicatePage(
            (pageNumber: number) =>
                discrepancyStrategy.btRetrieveFunc(
                    transactionId,
                    tenantId,
                    this.appConfigService.discrepancy.maxBatchSize,
                    pageNumber,
                ) as Promise<object[]>,
            discrepancyStrategy.btOmittedPropsForDuplicateCheck,
        );

        const transformed = rawData
            .map((btData: any) => discrepancyStrategy.btToDbEntity(btData))
            .map((data: any) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
            .map((data: any) => JSON.parse(JSON.stringify(data))); // Remove undefined values

        return { raw: rawData as T[], transformed };
    }

    /**
     * Fetch data from local database with pagination; retried once, and only for transient database errors.
     */
    public async fetchFromDatabase<T>(
        discrepancyStrategy: DiscrepancyStrategy<unknown, unknown, unknown>,
        transactionId: string,
        tenantId: number,
        entityType: string,
    ): Promise<T[]> {
        await RetryUtility.delay(DiscrepancyScannerService.DELAY_BETWEEN_CALLS_MS);

        return await RetryUtility.executeDatabaseOperation(async () => {
            return (
                await PaginationUtility.queryUntilLastPage((pageNumber: number) =>
                    discrepancyStrategy.dbRetrieveFunc(
                        transactionId,
                        tenantId,
                        this.appConfigService.discrepancy.maxBatchSize,
                        pageNumber,
                    ),
                )
            )
                .map((data: any) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
                .map((data: any) => JSON.parse(JSON.stringify(data))); // Remove undefined values
        }, `Database query for ${entityType}`);
    }

    /**
     * Fetch data from local database with error handling for not found errors.
     * Used for relation entities where parent might not exist.
     */
    public async fetchFromDatabaseWithErrorHandling<T>(
        discrepancyStrategy: DiscrepancyStrategy<unknown, unknown, unknown>,
        transactionId: string,
        tenantId: number,
    ): Promise<T[]> {
        return (
            await PaginationUtility.queryUntilLastPage((pageNumber: number) =>
                discrepancyStrategy
                    .dbRetrieveFunc(transactionId, tenantId, this.appConfigService.discrepancy.maxBatchSize, pageNumber)
                    .catch((error: any) => {
                        if (error instanceof Error && error.constructor.name === 'NotFoundException') {
                            return [];
                        }
                        throw error;
                    }),
            )
        )
            .map((data: any) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
            .map((data: any) => JSON.parse(JSON.stringify(data))); // Remove undefined values
    }

    /**
     * Analyze discrepancies between BeyondTrust and database data.
     * Identifies: identical, only in BT, only in DB, and mismatched records.
     */
    public analyzeDiscrepancies<T extends { id: any }>(btData: T[], dbData: T[]): DiscrepancyAnalysis<T> {
        console.log(`🔍 Analyzing discrepancies...`);

        // 1. identical
        const identical = intersectionWith(btData, dbData, isEqual);

        // 2. remaining
        const remainingBtData = differenceWith(btData, identical, isEqual);
        const remainingDbData = differenceWith(dbData, identical, isEqual);

        // 3. only in one side
        const onlyInBt = differenceBy(remainingBtData, remainingDbData, 'id');
        const onlyInDb = differenceBy(remainingDbData, remainingBtData, 'id');

        // 4. different content
        const differentPairs = intersectionBy(remainingBtData, remainingDbData, 'id')
            .map((bt) => {
                const db = remainingDbData.find((d) => d.id === bt.id);
                return db && !isEqual(bt, db) ? { bt, db } : null;
            })
            .filter((pair) => pair !== null) as Array<{ bt: T; db: T }>;

        console.log(
            `📊 Analysis complete: ${identical.length} identical, ${onlyInBt.length} only in BT, ${onlyInDb.length} only in DB, ${differentPairs.length} mismatched`,
        );

        return {
            identical,
            onlyInBt,
            onlyInDb,
            differentPairs,
        };
    }

    /**
     * Analyze discrepancies for relational entities using custom comparison properties.
     * Used for many-to-many relationships where comparison is based on parent/child IDs.
     */
    public analyzeRelationalDiscrepancies<T>(
        btData: T[],
        dbData: T[],
        comparisonProps: { parent: keyof T; child: keyof T },
    ): DiscrepancyAnalysis<T> {
        // 1. identical
        const identical = intersectionWith(btData, dbData, isEqual);

        // 2. remaining
        const remainingBtData = differenceWith(btData, identical, isEqual);
        const remainingDbData = differenceWith(dbData, identical, isEqual);

        // 3. only in one side (compare by parent/child keys)
        const onlyInBt = differenceWith(
            remainingBtData,
            remainingDbData,
            (bt, db) =>
                bt[comparisonProps.parent] === db[comparisonProps.parent] &&
                bt[comparisonProps.child] === db[comparisonProps.child],
        );

        const onlyInDb = differenceWith(
            remainingDbData,
            remainingBtData,
            (bt, db) =>
                bt[comparisonProps.parent] === db[comparisonProps.parent] &&
                bt[comparisonProps.child] === db[comparisonProps.child],
        );

        // 4. different content
        const differentPairs = intersectionWith(
            remainingBtData,
            remainingDbData,
            (bt, db) =>
                bt[comparisonProps.parent] === db[comparisonProps.parent] &&
                bt[comparisonProps.child] === db[comparisonProps.child],
        )
            .map((bt) => {
                const db = remainingDbData.find(
                    (db) =>
                        db[comparisonProps.parent] === bt[comparisonProps.parent] &&
                        db[comparisonProps.child] === bt[comparisonProps.child],
                );
                return db && !isEqual(bt, db) ? { bt, db } : null;
            })
            .filter((pair) => pair !== null) as Array<{ bt: T; db: T }>;

        return {
            identical,
            onlyInBt,
            onlyInDb,
            differentPairs,
        };
    }

    /**
     * Get timestamp for marking when sync started.
     * Used to delete obsolete discrepancies that weren't updated during current scan.
     *
     * Callers stamp every record of a run with this one value, and the cleanup deletes what is older. The value
     * is truncated to whole seconds so that this also holds for a column without fractional seconds (TypeORM
     * creates last_modification_date as timestamp(6); a timestamp(0) column, e.g. from a manual migration, would
     * store a record of the start second as earlier than an untruncated start and lose it in the cleanup).
     */
    public getSyncStartDate(): Date {
        const now = DateUtility.getCurrentUtcDate();

        return new Date(Math.floor(now.getTime() / 1000) * 1000);
    }

    /**
     * Get delay in milliseconds between consecutive calls.
     */
    public get delayBetweenCallsMs(): number {
        return DiscrepancyScannerService.DELAY_BETWEEN_CALLS_MS;
    }
}
