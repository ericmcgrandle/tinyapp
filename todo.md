
if a URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message


POST /urls
if user is not logged in:
(Minor) returns HTML with a relevant error message

POST /login
if email and password params don't match an existing user:
returns HTML with a relevant error message

POST /register
if email already exists:
returns HTML with a relevant error message



