import React, { Component } from 'react';
import './App.css';
import Home from './Home'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row bg-light my-5 pb-5 border-secondary border rounded">
            <Home/>
          </div>          
        </div>
      </div>
    );
  }
}

export default App;
