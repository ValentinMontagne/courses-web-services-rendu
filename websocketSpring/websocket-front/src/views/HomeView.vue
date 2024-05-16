<script setup lang="ts">
import { ref, onMounted } from 'vue';
import socket from '@/webscoket/index';

const message = ref('');
const messages = ref<string[]>([]);

const sendMessage = () => {
  socket.emit('chat message', message.value);
  message.value = '';
};

onMounted(() => {
  socket.on('chat message', (data: string) => {
    console.log(data)
    messages.value.push(data)
  });
});
</script>

<template>
  <ul id="messages">
    <li v-for="message in messages">{{ message }}</li>
  </ul>
  <form id="form" @submit.prevent="sendMessage">
    <input v-model="message" id="input" type="text" placeholder="Type a message" />
    <button>Send</button>
  </form>
</template>


<style>
body {
  margin: 0;
  padding-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#form {
  background: rgba(0, 0, 0, 0.15);
  padding: 0.25rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 3rem;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

#input {
  border: none;
  padding: 0 1rem;
  flex-grow: 1;
  border-radius: 2rem;
  margin: 0.25rem;
}

#input:focus {
  outline: none;
}

#form > button {
  background: #333;
  border: none;
  padding: 0 1rem;
  margin: 0.25rem;
  border-radius: 3px;
  outline: none;
  color: #fff;
}

#messages {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#messages > li {
  padding: 0.5rem 1rem;
}

#messages > li:nth-child(odd) {
  background: #efefef;
}
</style>