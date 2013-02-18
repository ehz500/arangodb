window.arangoDocument = Backbone.Collection.extend({
  url: '/_api/document/',
  model: arangoDocument,
  collectionInfo: {},
  CollectionTypes: {},
  addDocument: function (collectionID) {
    var self = this;
    var doctype = self.collectionApiType(collectionID);
    if (doctype === 'edge') {
      alert("adding edge not implemented");
      return false;
    }
    else if (doctype === "document") {
      self.createTypeDocument(collectionID);
    }
  },
  createTypeDocument: function (collectionID) {
    $.ajax({
      type: "POST",
      url: "/_api/document?collection=" + collectionID,
      data: JSON.stringify({}),
      contentType: "application/json",
      processData: false,
      success: function(data) {
        window.location.hash = "collection/"+data._id;
      },
      error: function(data) {
        alert(JSON.stringify(data));
      }
    });
  },
  collectionApiType: function (identifier) {
    if (this.CollectionTypes[identifier] == undefined) {
      this.CollectionTypes[identifier] = this.getCollectionInfo(identifier).type;
    }

    if (this.CollectionTypes[identifier] == 3) {
      return "edge";
    }
    return "document";
  },
  getCollectionInfo: function (identifier) {
    var self = this;

    $.ajax({
      type: "GET",
      url: "/_api/collection/" + identifier + "?" + self.getRandomToken(),
      contentType: "application/json",
      processData: false,
      async: false,
      success: function(data) {
        self.collectionInfo = data;
      },
      error: function(data) {
      }
    });

    return self.collectionInfo;
  },
  getRandomToken: function () {
    return Math.round(new Date().getTime());
  },
  getDocument: function (colid, docid, view) {
    this.clearDocument();
    var self = this;
    $.ajax({
      type: "GET",
      url: "/_api/document/" + colid +"/"+ docid,
      contentType: "application/json",
      processData: false,
      success: function(data) {
        window.arangoDocumentStore.add(data);

        if (view == "source") {
          window.documentSourceView.fillSourceBox();
        }
        else {
          window.documentView.initTable();
          window.documentView.drawTable();
        }
      },
      error: function(data) {
      }
    });
  },

  saveDocument: function (view) {
    if (view == "source") {
      var model = $('#documentSourceBox').val();
      var tmp1 = window.location.hash.split("/")[2];
      var tmp2 = window.location.hash.split("/")[1];
      var docID = tmp2 + "/" + tmp1;
    }
    else {
      var tmp = this.models[0].attributes;
      var model = JSON.stringify(tmp);
      var docID = this.models[0].attributes._id;
    }


    $.ajax({
      type: "PUT",
      url: "/_api/document/" + docID,
      data: model,
      contentType: "application/json",
      processData: false,
      success: function(data) {
        console.log("saved");
      },
      error: function(data) {
        //alert(getErrorMessage(data));
        console.log(data);
      }
    });

  },

  updateLocalDocument: function (data) {
    this.clearDocument();
    this.add(data);
  },
  clearDocument: function () {
    window.arangoDocumentStore.reset();
  }

});
