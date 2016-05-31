import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Navigator,
    Text,
    View,
} from 'react-native';
import ScreenFeed from './app/screen.feed';


class yy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bootstrapped: false
    }
  }

  componentWillMount() {
    this.setState({bootstrapped: true});
  }


  render() {
    if (this.state.bootstrapped == false) {
      return <View />;
    }

    let defaultName = ' 阅';
    let defaultComponent = ScreenFeed;
    return (

        <Navigator
            initialRoute={{ name: defaultName, component: defaultComponent }}
            configureScene={(route) => {
            return Navigator.SceneConfigs.PushFromRight;
          }}
            renderScene={(route, navigator) => {
            let Component = route.component;
            return <Component {...route.params} navigator={navigator} />
          }} />
    )
  }
}


const styles = StyleSheet.create({
  container: {},

});

AppRegistry.registerComponent('yy', () => yy);
