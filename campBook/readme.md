RESTFUL ROUTES

name        url         verb        desc.
===============================================================
INDEX       /camps      GET         display a list of all camps
NEW         /camps/new  GET         display form to create new camp
CREATE      /camps      POST        Add new camp to db 
SHOW        /camps/:id  GET         Show info about one camp 

COMMENTS

NEW         /camps/:id/comments/new     GET
CREATE      /camps/:id/comments         POST