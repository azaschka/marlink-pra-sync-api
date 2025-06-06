# PRA Sync API Development Status

## 06.06.2025

### Endpoints

| Module                            | Endpoint             | Open API definition | Endpoint validation | BT integration | DB integration | Notes                        |
| --------------------------------- | -------------------- | ------------------- | ------------------- | -------------- | -------------- | ---------------------------- |
| Users                             | Create               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve             | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify group policy  | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Teams                             | Create               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve             | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Add user             | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                                   | Delete user          | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Group Policies                    | Create               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve             | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Add jumpoint         | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                                   | Remove jumpoint      | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Jump Policies                     | Create               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve             | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Groups                       | Create               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve             | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Items (remote-rdp)           | Create               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Retrieve             | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Modify               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Delete               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Copy                 | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
| Jump Items (shell-jump)           | Create               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Retrieve             | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Modify               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Delete               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Copy                 | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
| Jump Items (web-jump)             | Create               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Retrieve             | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Modify               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Delete               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Copy                 | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
| Jump Items (remote-vnc)           | Create               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Retrieve             | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Modify               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Delete               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Copy                 | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
| Jump Items (protocol-tunnel-jump) | Create               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Retrieve             | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Modify               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Delete               | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Copy                 | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
| Jumpoints                         | Create               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve             | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Sync (job)                        | Users                | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Teams                | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Group policies       | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump policies        | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump groups          | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump items           | 🛠️                  | 🛠️                  | 🛠️             | 🛠️             | on progress                  |
|                                   | Jumpoints            | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Users group policies | ✅                  | ✅                  | ✅             | ✅             | Executed after users sync    |
