import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { baseUrl } from './api';
import styled from 'styled-components';

const Title = styled.h1`
  transform: rotate(270deg);
  transform-origin: bottom left;
  position: absolute;
  bottom: 0;
  font-size: 2.5em;
  font-weight: 300;
  text-align: center;
  margin: 0 -20px;
`;

class Recipe extends Component {
  static propTypes = {
    recipeId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      recipe: null,
      lastBake: null,
    };
  }

  componentWillMount() {
    this.fetchRecipe();
    this.fetchLastBake();
  }

  componentWillUpdate(nextProps) {
    if (this.props.recipeId !== nextProps.recipeId) {
      this.fetchRecipe();
    }
  }

  render() {
    if (!this.state.recipe || !this.state.lastBake || !this.state.instagram) return null;

    return (
      <div className='recipe'>
        <Title>{this.state.recipe.Name}</Title>
        <img className='recipe-photo' src={this.state.instagram.thumbnail_url} alt={this.state.recipe.Name} />
      </div>
    );
  }

  coverPhoto() {
    if (this.state.recipe) {
      return this.state.recipe.Photos[0].url;
    }
  }

  fetchRecipe() {
    const { recipeId } = this.props;

    fetch(`${baseUrl}/recipe/${recipeId}`)
      .then(response => response.json())
      .then(json => this.setState({recipe: json}, this.fetchLastBake));
  }

  fetchLastBake() {
    if (!this.state.recipe) return;

    const bakeId = this.state.recipe['Baked on'][0];

    fetch(`${baseUrl}/bake/${bakeId}`)
      .then(response => response.json())
      .then(json => this.setState({lastBake: json}, this.fetchInstgramPhoto));
  }

  fetchInstgramPhoto() {
    if (!this.state.lastBake) return;

    const instagramLink = this.state.lastBake['Instagram'];

    fetch(`https://api.instagram.com/oembed/?url=${instagramLink}`)
      .then(response => response.json())
      .then(json => this.setState({instagram: json}));
  }
}

export default Recipe;
