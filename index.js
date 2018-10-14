var pdfreader = require('pdfreader');
var fs = require('fs')
var rows = {};
var stuArr = [];
var obj = {};
var subject = [];
var subArr = [];
var students = {};
var institute;
var imarks = {}
var z = 0;
var itotal = 0;
var source = process.argv[2];
var destination = process.argv[3];

function printRows() {
  stuArr = [];
  subArr = [];
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach(function (y) {
      stuArr.push((rows[y] || []).join(''))
      subArr.push((rows[y] || []).join(''))
    });
  if (stuArr[0] === 'RESULT') {
    parseStudentPage();
  } else {
    parseSubjectPage();
  }
}
new pdfreader.PdfReader().parseFileItems(source, function (err, item) {
  if (!item || item.page) {
    // end of file, or page
    printRows();
    rows = {}; // clear rows for next page
  } else if (item.text) {
    // accumulate text items into rows object, per line
    (rows[item.y] = rows[item.y] || []).push(item.text);
  }
});

function parseStudentPage() {
  if (stuArr[0] === 'RESULT') {
    stuArr.splice(0, 9)
    stuArr.forEach(function (i) {
      if (stuArr.indexOf(i) % 2 == 0) {
        var str = "";
        var x = i.indexOf(" THEORYUES") - 10;
        if (x < 0) {
          x = i.indexOf(" PRACTICALUES") - 13;
          str = " Practical";
        }
        subject.push(i.substr(14, x - 6) + str);
      }
    })
  }
}

function parseSubjectPage() {
  subArr.splice(0, 13);
  if (subArr.length > 1) {
    institute = (subArr[0].substr(subArr[0].lastIndexOf("Institution: ") + "Institution: ".length, subArr[0].length - subArr[0].lastIndexOf("Institution: ")))
    enroll = (subArr[1].substr(0, 11));
    subArr.splice(0, 3);
  }
  while (subArr.length > 6) {
    if (enroll.length < 11) {
      enroll = (subArr[6].substr(0, 11));
      subArr.splice(0, 8);
      continue;
    }
    z = 0;
    itotal = 0;
    marks = {}
    obj = {}
    obj.name = subArr[0];
    obj.enroll = enroll;
    enroll = (subArr[6].substr(0, 11));
    obj.institute = institute;
    var arr = subArr[2]
    var res1 = arr.replace(/[A]/g, " A ");
    var res2 = res1.replace(/[-]/g, " - ");
    var res3 = res2.split("  ").join(" ");
    var res4 = res3.trim();
    var m = res4.split(" ")
    for (var i = 0; i < m.length; i++) {
      imarks = {}
      if (isNaN(parseInt(m[i])))
        m[i] = 0;
      if (isNaN(parseInt(m[i + 1])))
        m[i + 1] = 0;
      imarks.sessional = parseInt(m[i])
      imarks.external = parseInt(m[i + 1]);
      imarks.total = parseInt(m[i]) + parseInt(m[i + 1]);
      marks[subject[z++]] = imarks;
      itotal = itotal + parseInt(m[i]) + parseInt(m[i + 1]);
      i++;
    }
    obj['total'] = itotal;
    obj['percentage'] = itotal * 2 / m.length;
    obj['marks'] = marks;
    students[obj.enroll] = obj;
    subArr.splice(0, 8);
  }
  var jsonContent = JSON.stringify(students, null, 4)
  fs.writeFile(destination, jsonContent, 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
    }
  });
}