const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)
  
  if (!user) {
    return response.status(400).json({error: "username not found."})
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const { user } = request;
  
  const userAlreadyExists = users.some(
    user => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({error: "username already exists."})
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser);
  
  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

function checkExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  
  const checkTodoExists = user.todos.find(todo => todo.id === id);

  if (!checkTodoExists) {
    return response.status(404).json({error: "Todo not found."})
  }

  request.todo = checkTodoExists;
  return next();
}


app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  let todoToReturn = null;

  user.todos.map(todo => {
  if (todo.id === id) {
    todo.title = title;
    todo.deadline = deadline;
    todoToReturn = todo;
  }
  });

  return response.status(201).json(todoToReturn);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  let todoToReturn = null;

  user.todos.map(todo => {
  if (todo.id === id) {
    console.log("passei por ti!")
    todo.done = true;
    todoToReturn = todo;
  }
  });

  return response.status(200).json(todoToReturn);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos.splice(user, 1);

  return response.status(204).send();
});

module.exports = app;