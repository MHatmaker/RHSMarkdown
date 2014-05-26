###Startup Notes

####NodeJS

1. cd to RHSMarkdown directory
2. npm start

####Mongodb

1.  cd  c:\Program Files\MongoDB 2.6 Standard\bin
2. mongod --dbpath C:\JavascriptDevelopment\RHSMarkdown\data


####To Insert Data

1.  cd  c:\Program Files\MongoDB 2.6 Standard\bin
2. mongo
3. > use RHSMarkdown
4. > db.docCollection.insert(<<< complete list of docs from TOC.js (including []) around dictionaries>>>);
5. > db.docCollection.find().pretty()
6. > db.docCollection.remove({"_id": ObjectId("5360502b6611df8c65cdbc5d")});
7. > quit()
