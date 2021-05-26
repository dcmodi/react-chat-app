import React from "react";
import {Route,Switch} from 'react-router-dom'
import Home from './Home'
import Chat from './Chat'

const App = () => {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/chat/:user/:room" component={Chat} />
      </Switch>
    </>
  );
};

export default App;
