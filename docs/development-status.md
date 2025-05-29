# PRA Sync API Development Status

## 22.05.2025

### Endpoints

| Module         | Endpoint              | Open API definition | Endpoint validation | BT integration | DB integration | Notes                        |
| -------------- | --------------------- | ------------------- | ------------------- | -------------- | -------------- | ---------------------------- |
| Users          | Create                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Retrieve              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Modify                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Delete                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Add group policy      | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Remove group policy   | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Reset password        | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Teams          | Create                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Retrieve              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Modify                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Delete                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Add user              | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Delete user           | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Group Policies | Create                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Retrieve              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Modify                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Delete                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Add user              | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Remove user           | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Jump Policies  | Create                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Retrieve              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Modify                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Delete                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Groups    | Create                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Retrieve              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Modify                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Delete                | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                | Retrieve jump items   | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Jump Items     | Create                | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Retrieve              | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Modify                | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Delete                | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Copy                  | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Add jump groups       | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Remove jump groups    | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Jumpoints      | Create                | ⚠️                  | ✅                  | ✅             | ✅             | TODO                         |
|                | Retrieve              | ⚠️                  | ✅                  | ✅             | ✅             | TODO                         |
|                | Modify                | ⚠️                  | ✅                  | ✅             | ✅             | TODO                         |
|                | Delete                | ⚠️                  | ✅                  | ✅             | ✅             | TODO                         |
|                | Add group policies    | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                | Remove group policies | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Sync (job)     | Users                 | ✅                  | ✅                  | ✅             | ✅             |                              |
|                | Teams                 | ✅                  | ✅                  | ✅             | ✅             |                              |
|                | Group policies        | ✅                  | ✅                  | ✅             | ✅             |                              |
|                | Jump policies         | ✅                  | ✅                  | ✅             | ✅             |                              |
|                | Jump groups           | ✅                  | ✅                  | ✅             | ✅             |                              |
|                | Jump items            | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | TODO                         |
|                | Jumpoints             | ✅                  | ✅                  | ✅             | ✅             | on progress                  |
