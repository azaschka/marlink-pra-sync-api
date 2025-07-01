# PRA Sync API Development Status

## 12.06.2025

### Endpoints

| Module                            | Endpoint                          | Open API definition | Endpoint validation | BT integration | DB integration | Notes                              |
| --------------------------------- | --------------------------------- | ------------------- | ------------------- | -------------- | -------------- | ---------------------------------- |
| Health                            | Retrieve                          | ✅                  |                     |                |                |                                    |
| Logs                              | Retrieve                          | ✅                  | ✅                  |                | ✅             |                                    |
| BT Instances                      | Create                            | ✅                  | ✅                  |                | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  |                | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  |                | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  |                | ✅             |                                    |
| Users                             | Create                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify group policy               | ✅                  | ✅                  | ✅             | ✅             |                                    |
| Teams                             | Create                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Add user                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete user                       | ✅                  | ✅                  | ✅             | ✅             |                                    |
| Jump Client                       | Copy                              | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Create installer                  | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete installer                  | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve installer                | ✅                  | ✅                  | ✅             | ✅             |                                    |
| Group Policies                    | Create                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Add jumpoint                      | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Remove jumpoint                   | ✅                  | ✅                  | ✅             | ✅             |                                    |
| Jump Policies                     | Create                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
| Jump Groups                       | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
| Jump Items (remote-rdp)           | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
| Jump Items (shell-jump)           | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
| Jump Items (web-jump)             | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
| Jump Items (remote-vnc)           | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
| Jump Items (protocol-tunnel-jump) | Create                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Retrieve                          | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Modify                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Delete                            | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
|                                   | Copy                              | ⚠️                  | ✅                  | ✅             | ✅             | OpenAPI still to be improved       |
| Jumpoints                         | Create                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Retrieve                          | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Modify                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Delete                            | ✅                  | ✅                  | ✅             | ✅             |                                    |
| Sync (job)                        | Users                             | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Teams                             | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump client                       | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump client installer             | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Group policies                    | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump policies                     | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump groups                       | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump items (remote-rdp)           | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump items (shell-jump)           | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump items (web-jump)             | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump items (remote-vnc)           | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jump items (protocol-tunnel-jump) | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | Jumpoints                         | ✅                  | ✅                  | ✅             | ✅             |                                    |
|                                   | User group policies               | ✅                  | ✅                  | ✅             | ✅             | Executed after users sync          |
|                                   | Team users                        | ✅                  | ✅                  | ✅             | ✅             | Executed after teams sync          |
|                                   | Group policy jumpoints            | ✅                  | ✅                  | ✅             | ✅             | Executed after group policies sync |
