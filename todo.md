if a URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message

GET /urls/:id
if user is not logged in:
returns HTML with a relevant error message
if user is logged it but does not own the URL with the given ID:
returns HTML with a relevant error message

GET U/:id
if URL for the given ID does not exist:
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



