import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { baseUrl } from './api';

class Bake extends Component {
  static propTypes = {
    bakeId: PropTypes.string.isRequired,
  };

  componentWillMount() {
    this.fetchBake();
  }

  componentWillUpdate(nextProps) {
    if (this.props.bakeId !== nextProps.bakeId) {
      this.fetchBake();
    }
  }

  render() {
    if (!this.state || !this.state.bake) return null;
    return (<div>{this.state.bake.Notes}</div>);
  }

  fetchBake() {
    const { bakeId } = this.props;

    fetch(`${baseUrl}/bake/${bakeId}`)
      .then(response => response.json())
      .then(json => this.setState({bake: json}));
  }
}

export default Bake;
