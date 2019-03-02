import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import Users from './users';
import './App.css';

const client = new ApolloClient({
  uri: "http://192.168.200.133:4001/"
})

const App = () => (
  <ApolloProvider class="App" client={client}>
    <Users />
  </ApolloProvider>
)

export default App;
