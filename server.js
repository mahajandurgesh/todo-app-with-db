const express = require('express');
const fs = require('fs');
const multer  = require('multer');
const db = require('./models/db.js');
const TodoModel = require('./models/Todo.js');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 10000) + '.jpg');
    }
});
const upload = multer({ storage: storage })
const app = express();

db.init().then(function() {
    console.log('Connected to database');
    app.listen(3000, function() {
        console.log('Server running on port 3000');
    });
}).catch(function(err) {
    console.log('Error connecting to database');
    console.log(err);
});

app.use(express.json());
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/todoViews/index.html');
});

app.get('/css/style.css', function(req, res) {
    res.sendFile(__dirname + '/todoViews/css/style.css');
});

app.get('/todo.js', function(req, res) {
    res.sendFile(__dirname + '/todoViews/js/todo.js');
});

app.get('/getTodos', function(req, res) {
    TodoModel.find({}).then(function(todos) {
        res.status(200).send(todos);
    }).catch(function(err) {
        res.status(500).send('Error reading from database');
    });
});

app.post('/todo', upload.single('todopic'), function(req, res) {
    let todoContent = req.body.input;
    let todoPicture;
    if(req.file) {
        todoPicture = req.file.filename;
    }
    
    let todoCompleted = false;
    
    let todo = {todoContent, todoPicture, todoCompleted};
    TodoModel.create(todo).then(function() {
        res.status(200).redirect('/');
    }).catch(function(err) {
        res.status(500).send('Error writing to database');
    });
});

app.post('/updateTodo', function(req, res) {
    let todoId = req.body.todoId;
    let todoCompleted = req.body.todoCompleted;
    TodoModel.updateOne({_id: todoId}, {todoCompleted: todoCompleted}).then(function() {
        res.status(200).send('Success');
    }).catch(function(err) {
        res.status(500).send('Error updating database');
    });
});

app.post('/deleteTodo', function(req, res) {
    let todoId = req.body.todoId;
    TodoModel.findOne({_id: todoId}).then(function(todo) {
        if(todo.todoPicture) {
            fs.unlink('./public/' + todo.todoPicture, function(err) {
                if(err) {
                    console.log(err);
                }
            });
        }
        TodoModel.deleteOne({_id: todoId}).then(function() {
            res.status(200).send('Success');
        }
        ).catch(function(err) {
            res.status(500).send('Error deleting from database');
        });
    });
});