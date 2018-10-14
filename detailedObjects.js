var express = require('express')
var app = express()
var json1 = require('./1st.json');
var json2 = require('./2nd.json');
var json3 = require('./3rd.json');
var json4 = require('./4th.json');
var json5 = require('./5th.json');
var json6 = require('./6th.json');

var arr = [json1, json2, json3, json4, json5, json6]

app.get('/:sem', function (req, res) {
    res.send(arr[req.params.sem])
})

app.get('/:sem/:id', function (req, res) {
    console.log(req.params.sem)
    res.send(arr[req.params.sem][req.params.id])
})

app.listen(3000)