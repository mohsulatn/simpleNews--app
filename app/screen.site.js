/**
 * feed articles list
 * @wtser
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    TouchableOpacity,
    WebView,
    Dimensions
} from 'react-native';
import ScreenDetail from './screen.detail'
import jsdom from 'jsdom-jscore'
import SafariView from 'react-native-safari-view'

class ScreenSite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            articles: [],
            load: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
        };

        this._viewDetail = this._viewDetail.bind(this);
        this._viewMore = this._viewMore.bind(this);
        this.renderQuestion = this.renderQuestion.bind(this);
        this.renderQuestionNext = this.renderQuestionNext.bind(this);
        this._pressButtonBack = this._pressButtonBack.bind(this);
    }

    componentDidMount() {
        //这里获取从FirstPageComponent传递过来的参数: feed
        var feed = this.state.feed = this.props.feed;
        this.fetchData(feed);
    }

    _parseNextPage(feed, nextUrl) {
        if (feed.type == "html") {
            if (nextUrl.indexOf('http') === -1) {
                var baseUrl = feed.url.match(/http[s]?:\/\/+[\s\S]+?\//)[0].slice(0, -1);
                if (nextUrl[0] !== '/') {
                    baseUrl += '/';
                }
                nextUrl = baseUrl + nextUrl;
            }
        }
        return nextUrl

    }

    _parseArticles(feed, articleNodes) {


        callback = {
            compatible: function () {
                var article, baseUrl, i, item, parsedData = [];
                if (articleNodes.length > 0) {
                    i = 0;
                    while (i < articleNodes.length) {
                        item = articleNodes[i];
                        article = {
                            title: item.textContent.replace(/^\<img[\s\S]+\>/, "").trim(),
                            href: item.attributes.href._nodeValue
                        };
                        if (article.href.indexOf('http') === -1) {
                            baseUrl = feed.url.match(/http[s]?:\/\/+[\s\S]+?\//)[0].slice(0, -1);
                            if (article.href[0] !== '/') {
                                baseUrl += '/';
                            }
                            article.href = baseUrl + article.href;
                        }
                        parsedData.push(article);
                        i++;
                    }
                    return parsedData;
                }
            },
            html: function () {
                var article, baseUrl, i, item, parsedData = [];
                if (articleNodes.length > 0) {
                    i = 0;
                    while (i < articleNodes.length) {
                        item = articleNodes[i];
                        article = {
                            title: item.querySelector(feed.selector.title).textContent.trim(),
                            href: item.querySelector(feed.selector.href).attributes.href._nodeValue
                        };
                        if (article.href.indexOf('http') === -1) {
                            baseUrl = feed.url.match(/http[s]?:\/\/+[\s\S]+?\//)[0].slice(0, -1);
                            if (article.href[0] !== '/') {
                                baseUrl += '/';
                            }
                            article.href = baseUrl + article.href;
                        }
                        parsedData.push(article);
                        i++;
                    }
                    return parsedData;
                }
            },
            ajax: function () {
                var data = JSON.parse(articleNodes);
                var parsedData = data[feed.selector.item].map(function (a) {
                    var baseUrl;
                    if (a[feed.selector.href].indexOf('http') === -1) {
                        baseUrl = feed.url.match(/http[s]?:\/\/+[\s\S]+?\//)[0].slice(0, -1);
                        if (a[feed.selector.href][0] !== '/') {
                            baseUrl += '/';
                        }
                        if (a[feed.selector.href][1] === "/") {
                            baseUrl = 'http:';
                        }
                        a[feed.selector.href] = baseUrl + a[feed.selector.href];
                    }
                    return {
                        title: a[feed.selector.title].trim(),
                        href: a[feed.selector.href]
                    };
                });
                return parsedData;
            }
        };
        return callback[feed.type]()

    }

    fetchData(feed) {

        var ajaxUrl;
        if (typeof feed.selector === "string") {
            feed.type = "compatible";
        } else if ((feed.selector.item === feed.selector.title || feed.selector.item === feed.selector.href) && !feed.selector.hasOwnProperty("next")) {
            feed.type = "compatible";
            feed.selector = feed.selector.item;
        }
        ajaxUrl = {
            compatible: feed.url,
            html: feed.url,
            ajax: feed.api
        };

        fetch(ajaxUrl[feed.type], {
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Cookie': 'gpid=099590f6492c4996a8799b6d47a53b69; gpid=6be53b8801064ee8ba4515b4df5c8943; gpsd=e0ea7d0404b734b257ee6c17a2b78d06; JSESSIONID=aaaNclM9R4-tQ-M0_C1rv; route=b167253e85e91d449a2b50ab36e88a41; __utma=9498528.1989996293.1441868673.1462332421.1462412637.58; __utmc=9498528; __utmz=9498528.1450173536.19.3.utmcsr=ten-read.wtser.com|utmccn=(referral)|utmcmd=referral|utmcct=/admin/article; __utmt=1; __utma=197952765.258845172.1439907605.1462332422.1462526681.54; __utmb=197952765.4.10.1462526681; __utmc=197952765; __utmz=197952765.1458806171.42.3.utmcsr=localhost:3000|utmccn=(referral)|utmcmd=referral|utmcct=/redirect',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.86 Safari/537.36'
            }
        })
            .then((response) => {
                return response.text()
            })
            .then((responseText)=> {
                    var _this = this;
                    var html = responseText;
                    feed.html = responseText;

                    jsdom.env(
                        feed.html,
                        function (errors, window) {
                            var articles = [];
                            var articleList = window.document.querySelectorAll(feed.selector.item || feed.selector);
                            var nextPage = window.document.querySelector(feed.selector.next);
                            if (nextPage) {
                                nextPage = nextPage.attributes.href._nodeValue
                                nextPage = _this._parseNextPage(feed, nextPage)
                                _this.state.feed.nextUrl = nextPage
                            }

                            if (feed.type == 'ajax') {
                                articleList = responseText
                            }
                            if (articleList.length > 0) {
                                articles = _this._parseArticles(feed, articleList)
                                _this.state.articles = _this.state.articles.concat(articles);
                            }


                            _this.setState({
                                dataSource: _this.state.dataSource.cloneWithRows(_this.state.articles),
                                load: true
                            });

                            // do something with $ to parse/scrape html body.
                        }
                    );


                }
            )
            .done();
    }


    _viewDetail(question) {

        SafariView.isAvailable()
            .then(SafariView.show({
                url: question.href,
                readerMode: true
            }))
            .catch(error => {
                // Fallback WebView code for iOS 8 and earlier
            });

    }

    _viewMore(site) {

        SafariView.isAvailable()
            .then(SafariView.show({
                url: site.url,
                readerMode: true
            }))
            .catch(error => {
                // Fallback WebView code for iOS 8 and earlier
            });

    }

    renderQuestion(question) {
        return (
            <TouchableOpacity onPress={()=> this._viewDetail(question)}>
                <View style={styles.row}>

                    <View style={{flex:1}}>
                        <Text style={styles.title}>{question.title}</Text>
                    </View>
                </View></TouchableOpacity>
        );

    }

    renderQuestionNext() {
        if (this.state.feed.hasOwnProperty('nextUrl')) {
            this.state.feed.url = this.state.feed.nextUrl
            this.fetchData(this.state.feed)
        }

    }

    renderLoadingView() {
        return (

            <View>
                <View style={styles.header}>

                    <Text style={{flex:1,textAlign:'center',color:'#333'}}>{this.props.feed.name}</Text>

                </View>
                <View>
                    <Text style={{flex:1}}>
                        Loading articles...
                    </Text>
                </View>
            </View>


        );
    }

    _pressButtonBack() {
        const {navigator} = this.props;
        //为什么这里可以取得 props.navigator?请看上文:
        //<Component {...route.params} navigator={navigator} />
        //这里传递了navigator作为props
        if (navigator) {
            navigator.pop()
        }
    }


    render() {

        if (!this.state.load) {
            return this.renderLoadingView();

        }

        return (
            <View>
                <View style={styles.header}>

                    <TouchableOpacity onPress={()=> this._pressButtonBack()}>
                        <Text style={{color:'#777',marginLeft:10}}>返回</Text>
                    </TouchableOpacity>

                    <Text style={{flex:1,textAlign:'center',color:'#333',fontWeight:'bold'}}>{this.state.feed.name}</Text>
                    <TouchableOpacity onPress={()=> this._viewMore(this.state.feed)}>
                        <Text style={{color:'#777',marginRight:10}}>更多</Text>
                    </TouchableOpacity>


                </View>

                <ListView style={styles.container}
                          dataSource={this.state.dataSource}
                          renderRow={this.renderQuestion}
                          onEndReached={this.renderQuestionNext}
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
        height: ScreenHeight,
        backgroundColor: '#fff'
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
    title: {
        color: "#555",
        fontSize: 14
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10


    },
});

module.exports = ScreenSite;
