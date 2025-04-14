# Naming Convention Guideline

## Rest API DTO Input/Output

| DTO Input                | DTO Output            | Http Method | Example (file/class/method name) |
| ------------------------ | --------------------- | ----------- | -------------------------------- |
| Create + (Noun)          | (Noun) + Created      | POST        | create user -> user created      |
| Retrieve + (Noun)        | (Noun) + Retrieved    | GET         | retrieve user -> user retrieved  |
| Update + (Noun)          | (Noun) + Updated      | PUT         | update user -> user updated      |
| Modify + (Noun)          | (Noun) + Modified     | PATCH       | modify user -> user modified     |
| Delete + (Noun)          | (Noun) + Deleted      | DELETE      | delete user -> user deleted      |
| <Present Tense> + (Noun) | (Noun) + <Past Tense> | <Any>       | copy user -> user copied         |
