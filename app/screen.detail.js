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
    AlertIOS
} from 'react-native';



class ScreenDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }), loaded: false,
        };
    }

    fetchData() {
        fetch(SF_HOT_QUESTION_URL)
            .then((response) => response.json())
            .then((responseData) => {

                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(responseData.data.rows),
                    loaded: true,
                });
            })
            .done();
    }

    componentDidMount() {
        this.fetchData();
    }

    renderQuestion(question) {
        return (
            <View style={styles.row}>
                <Image
                    source={{uri: question.user.avatarUrl}}
                    style={styles.avatar}
                />
                <View style={{flex:1}}>
                    <Text numberOfLines={1} style={styles.title}>{question.title}</Text>
                    <Text style={{color:"#999"}}>{question.user.name}</Text>
                </View>
            </View>
        );

    }

    renderLoadingView() {
        return (
            <View style={styles.container}>
                <Text>
                    Loading questions...
                </Text>
            </View>
        );
    }


    render() {

        if (!this.state.loaded) {
            return this.renderLoadingView();

        }
        return (
            <View>
                <ListView style={styles.container}
                          dataSource={this.state.dataSource}
                          renderRow={this.renderQuestion}
                />
            </View>
        )
    }
}


const styles = StyleSheet.create({

    header: {
        backgroundColor:'#005f3c',
        paddingTop:30,
        paddingBottom:10,
        flexDirection:'row'
    }
    ,
    container: {
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
    title: {},
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10


    },
});

module.exports = ScreenDetail;
