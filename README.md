# Task List

This backend allows users to manage their workload. After making an account,
a user will be able to create, read, update, and delete their tasks.

## Database

![](schema.svg)

<details>
<summary>See DBML</summary>

```dbml
table users {
  id serial [pk]
  username text [unique, not null]
  password text [not null]
}

table tasks {
  id serial [pk]
  title text [not null]
  done boolean [default: false, not null]
  user_id integer [not null]
}

Ref: users.id < tasks.user_id [delete: cascade]
```

</details>

1. Create a new Postgres database named `tasklist`.
2. Create tables in `schema.sql` according to the schema above.
3. Seed the database with at least 1 user owning at least 3 tasks.

## 🔐 Authentication Middleware

To protect your routes, you’ll need to implement JWT-based middleware that checks if a user is logged in. This middleware should verify the token sent in the request and store the decoded user information for use in your routes.

Once implemented, only users with a valid token will be able to access protected endpoints like viewing, creating, or editing tasks.

You have two options for organizing your middleware:


### Option 1: Use a middleware.js file

Create a new file called middleware.js and define your middleware functions there. This keeps your app.js clean and makes it easier to reuse and manage multiple middleware functions.

You will need to import your middleware into app.js (or your route files) and apply it to the routes that require authentication.


### Option 2: Define middleware directly in app.js

If you prefer, you can define your authentication logic at the top of your app.js file. This approach works well for smaller projects where you only have a few routes and want to keep everything in one place.

Make sure the function has access to the request, response, and next arguments, and that it’s applied to all routes that should be protected.

⸻


Regardless of which option you choose, your middleware should:

* Read the token from the request headers
* Verify the token using your secret
* Attach the decoded user data to the request object
* Prevent unauthorized access if the token is missing or invalid

Don’t forget to add this middleware to each protected route individually.

## API

Once your database is properly seeded, build an Express app that serves the following routes.

The 🔒lock icon next to a route indicates that it must be a protected route.
A user can only access that route by attaching a valid token to their request.
If a valid token is not provided, immediately send a 401 Unauthorized error.

`/users` router

- `POST /users/register`
  - sends 400 if request body is missing username or password
  - creates a new user with the provided credentials and sends a token
  - the password should be hashed in the database
- `POST /users/login`
  - sends 400 if request body is missing username or password
  - sends a token if the provided credentials are valid

`/tasks` router

- 🔒`POST /tasks` creates a new task owned by the logged-in user
  - sends 400 if request body does not include `title` and `done`
- 🔒`GET /tasks` sends array of all tasks owned by the logged-in user
- 🔒`PUT /tasks/:id` updates the specific task owned by the logged-in user
  - sends 400 if request body does not include `title` and `done`
  - sends 403 Forbidden if user does not own this task
- 🔒`DELETE /tasks/:id` deletes the specific task owned by the logged-in user
  - sends 403 Forbidden if user does not own this task
