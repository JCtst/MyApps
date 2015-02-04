#!/bin/sh

curl -i -X POST -H "Content-Type: application/json" -d '{ "email" : "user1@google.cz" , "password" : "pass1"  }' localhost:8080/accounts
curl -i -X POST -H "Content-Type: application/json" -d '{ "email" : "user2@google.cz" , "password" : "pass2"  }' localhost:8080/accounts
curl -i -X POST -H "Content-Type: application/json" -d '{ "email" : "user3@google.cz" , "password" : "pass3"  }' localhost:8080/accounts

curl -i -X GET "localhost:8080/access_token?email=user1@google.cz&password=pass1"
curl -i -X GET "localhost:8080/access_token?email=user2@google.cz&password=pass2"
curl -i -X GET "localhost:8080/access_token?email=user3@google.cz&password=pass3"

curl -i -H "Content-Type: application/json" -d '{ "firstName" : "James" , "lastName" : "Bond", "phone" : "007"  }' -X POST "localhost:8080/contacts?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InVzZXIxQGdvb2dsZS5jejtwYXNzMSI.rZN6RNROmleTZUAW6RxNFSqN6f21dcJcu3_z5PC0i68"
curl -i -H "Content-Type: application/json" -d '{ "firstName" : "Jura" , "lastName" : "Cibula", "phone" : "123456"  }' -X POST "localhost:8080/contacts?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InVzZXIxQGdvb2dsZS5jejtwYXNzMSI.rZN6RNROmleTZUAW6RxNFSqN6f21dcJcu3_z5PC0i68"

echo curl -i -v -include --form key1=value1 --form upload=@test.jpg -X POST "localhost:8080/photos?contactId=153&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InVzZXIxQGdvb2dsZS5jejtwYXNzMSI.rZN6RNROmleTZUAW6RxNFSqN6f21dcJcu3_z5PC0i68"
curl -i -v -include --form key1=value1 --form upload=@test.jpg -X POST "localhost:8080/photos?contactId=-JhGmdInskYL5b_boOH6&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InVzZXIxQGdvb2dsZS5jejtwYXNzMSI.rZN6RNROmleTZUAW6RxNFSqN6f21dcJcu3_z5PC0i68"

echo 
echo DONE!