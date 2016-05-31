/**
 * Yue React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Image,
    Text,
    View,
    ListView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    AlertIOS
} from 'react-native';

import ScreenSite from './screen.site';

var feeds = [];
class ScreenFeed extends Component {
    constructor(props) {
        super(props);
        var ds =
            this.state = {
                load: false,
                dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
            };
        this._viewFeed = this._viewFeed.bind(this)
        this.renderQuestion = this.renderQuestion.bind(this)
    }

    componentDidMount() {
        fetch('https://wtser.com/config/feeds.json')
            .then((response) => {
                return response.json()
            })
            .then((responseText) => {
                feeds = responseText
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(feeds),
                    load: true
                })
            })

    }


    _viewFeed(feed) {
        //AlertIOS.alert(feed)
        const {navigator} = this.props;
        //为什么这里可以取得 props.navigator?请看上文:
        //<Component {...route.params} navigator={navigator} />
        //这里传递了navigator作为props
        if (navigator) {
            navigator.push({
                name: 'SecondPageComponent',
                component: ScreenSite,
                params: {
                    feed: feed
                }
            })
        }
    }


    renderQuestion(question) {
        return (
            <TouchableOpacity onPress={()=> this._viewFeed(question)}>
                <View style={styles.row}>
                    <Image
                        source={{uri: question.icon}}
                        style={styles.avatar}
                    />
                    <View style={{flex:1}}>
                        <Text numberOfLines={1} style={styles.title}>{question.name}</Text>
                        <Text style={{color:"#999",fontSize:12}}>{question.desc}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );

    }


    renderLoadingView() {
        return (

        <View>
            <View style={styles.header}>

                <Text style={{flex:1,textAlign:'center',color:'#333',fontWeight:'bold'}}>阅阅</Text>

            </View>

            <View style={{alignItems: 'center',height:ScreenHeight,justifyContent: 'center',}}>
                <Text style={{ color:"#999"}}>
                    Loading...
                </Text>
            </View>
        </View>

        );
    }


    render() {

        if (!this.state.load) {
            return this.renderLoadingView()
        }


        return (
            <View>
                <View style={styles.header}>

                    <Text style={{flex:1,textAlign:'center',color:'#333',fontWeight:'bold'}}>阅阅</Text>

                </View>

                <ListView style={styles.container}
                          dataSource={this.state.dataSource}
                          renderRow={this.renderQuestion}
                />
            </View>
        )
    }
}

let ScreenHeight = Dimensions.get("window").height - 60;
const styles = StyleSheet.create({

    header: {
        backgroundColor: '#f1f1f1',
        paddingTop: 30,
        paddingBottom: 10,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        height: 58
    }
    ,
    container: {
        height: ScreenHeight
    },
    row: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',

    },
    title: {marginBottom: 5},
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10
    },
});

module.exports = ScreenFeed;
