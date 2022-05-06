// Write chatr code here!
// const getReq = new XMLHttpRequest();

// getReq.addEventListener('load',
//   function() {
//     console.log(this.responseText)
//     document.querySelector('body').innerText = this.responseText;
//   }
// )

// getReq.open(
//   'GET',
//   'https://pokeapi.co/api/v2/pokemon/pikachu'
// )

// $.ajax({
//   method: 'GET',
//   url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
//   success: function(data) {
//     console.log(data)
//   }
// })

// fetch documentation https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

// by default fetch will send a GET request to the provided URL
// fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
//   // fetch returns a promise which resolves to a Response Object
//   .then(function(res) {
//     // The response obj represents a HTTP response
//     console.log(res);
//     return res.json(); // in order to get the actual data the response object holds, we need to parse it using res.text()
//   })
//   .then(function(data) {
//     // data is the information embedded in the response from the server
//     console.log(data);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })



const loadMessages = (query) => {
    fetch('/messages')
    .then(function(res) { 
      return res.json();
    })
    .then(function(data) {
      const messagesContainer = document.querySelector('#messages');
      let messagesHTML = '';
      data.forEach(msg => {
          if (query && msg.flagged){
            messagesHTML += `
            <li>${msg.username}: <span data-id='${msg.id}' data-user='${msg.username}'>${msg.body}</span> - <button data-id='${msg.id}' class='flag-link'>${msg.flagged?'flagged':'flag'}</button><i data-id='${msg.id}' class='delete-link'>x</i></li>`
          } else if (!query ){
            messagesHTML += `
          <li>${msg.username}: <span data-id='${msg.id}' data-user='${msg.username}'>${msg.body}</span> - <button data-id='${msg.id}' class='flag-link'>${msg.flagged?'flagged':'flag'}</button><i data-id='${msg.id}' class='delete-link'>x</i></li>`
          } 
      });
      messagesContainer.innerHTML = messagesHTML;
    });
  }
  
  const deleteMessage = (id) => {
    fetch(`/messages/${id}`, {
      method: 'DELETE'
    }).then(() => {
      loadMessages()
    })
  }
  const flagMessage = (id) => {
    fetch(`/messages/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ flagged: true })
    }).then(() => {
      loadMessages()
    })
  }
  const flaggedMessage = (id) => {
    fetch(`/messages/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ flagged: false })
    }).then(() => {
      loadMessages()
    })
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.createElement("input");
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'username');
    input.setAttribute('placeholder', 'username');
    document.getElementById("new-message").prepend(input)
    const button = document.createElement('button');
    button.setAttribute('type', 'button')
    button.setAttribute('name', 'filter')
    button.setAttribute('id', 'filter')
    button.innerHTML = 'FILTER'
    document.getElementById("new-message").append(button)
    const id = document.createElement('label');
    id.setAttribute('id', 'msg-id')
    id.setAttribute('name', 'msg-id')
    document.getElementById("new-message").append(id)
    loadMessages();
  
    const form = document.querySelector('#new-message');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); 
        const f = event.currentTarget;
        const fd = new FormData(f);
        const msgId = document.querySelector('#new-message > label').innerText
        if (msgId){
            fetch(`/messages/${msgId}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ body: fd.get('body'), username: fd.get('username') })
            }).then(res => {
                loadMessages();
                event.target.reset();
                document.querySelector('#new-message > label').innerText = ' '
            })
        } else {
            fetch('/messages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ body: fd.get('body'), username: fd.get('username') })
            }).then(res => {
                loadMessages();
                event.target.reset();
            })
        }
    })
    let clicked = false
    document.querySelector('#filter').addEventListener('click', function(event) {
        if (clicked){
            loadMessages(false)
            clicked=false
        } else {
            loadMessages(true)
            clicked=true
        }
    })
  
    const messagesContainer = document.querySelector('#messages');
    messagesContainer.addEventListener('click', function(event) {
      if (event.target.matches('i.delete-link')) {
        deleteMessage(event.target.dataset.id);
      }
      if (event.target.matches('button.flag-link')) {
        if(event.target.innerText=='flag'){
            flagMessage(event.target.dataset.id);
        } else {
            flaggedMessage(event.target.dataset.id);
        }
      }
      if (event.target.matches('span')){
        document.querySelector("#new-message > textarea").value = event.target.innerText;
        document.querySelector("#new-message > input").value = event.target.dataset.user;
        document.querySelector('#new-message > label').innerText = event.target.dataset.id
      }
    })
  })