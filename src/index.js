import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import './index.css';
import App from './pages/App';
import Game from './pages/Game';

ReactDOM.render(
  <RecoilRoot>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/game" component={Game} />
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  </RecoilRoot>,
  document.getElementById('root')
);
