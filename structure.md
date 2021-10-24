# structure

## message

message model contains:

* content
* author
* date written
* unix time

## chat

represents a chatroom. model contains:

* room id (uses mongo id)
* room name
* people with access to room
* array of references to messages
