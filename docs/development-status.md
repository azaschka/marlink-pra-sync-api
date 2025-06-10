# PRA Sync API Development Status

## 10.06.2025

### Endpoints

| Module                            | Endpoint                          | Open API definition | Endpoint validation | BT integration | DB integration | Notes                        |
| --------------------------------- | --------------------------------- | ------------------- | ------------------- | -------------- | -------------- | ---------------------------- |
| Users                             | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify group policy               | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Teams                             | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Add user                          | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                                   | Delete user                       | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Group Policies                    | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Add jumpoint                      | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
|                                   | Remove jumpoint                   | ❌                  | ❌                  | ❌             | ❌             | TODO                         |
| Jump Policies                     | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Groups                       | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Items (remote-rdp)           | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Items (shell-jump)           | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Items (web-jump)             | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Items (remote-vnc)           | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jump Items (protocol-tunnel-jump) | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Jumpoints                         | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved |
| Sync (job)                        | Users                             | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Teams                             | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Group policies                    | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump policies                     | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump groups                       | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump items (remote-rdp)           | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump items (shell-jump)           | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump items (web-jump)             | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump items (remote-vnc)           | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jump items (protocol-tunnel-jump) | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Jumpoints                         | ✅                  | ✅                  | ✅             | ✅             |                              |
|                                   | Users group policies              | ✅                  | ✅                  | ✅             | ✅             | Executed after users sync    |
