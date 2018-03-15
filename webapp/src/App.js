import React, { Component } from 'react';
import styled from 'styled-components';
import './App.css';
import Recipe from './Recipe';
import { baseUrl } from './api';

const AppContainer = styled.div`
  margin: 50px auto;
  width: 500px;
  position: relative;
`;

class App extends Component {
  componentWillMount() {
    this.fetchRecipes();
  }

  render() {
    return (
      <AppContainer>
        { this.state && this.state.recipes && <Recipe recipeId={this.state.recipes[1].id}></Recipe> }
      </AppContainer>
    );
  }

  fetchRecipes() {
    fetch(`${baseUrl}/recipes`)
      .then(response => response.json())
      .then(json => this.setState({recipes: json}));
  }
}

export default App;
