var arr = [
    {
        id: "system",
        title: "Add a Probe",
        x: 2,
        y: 0,
        width: 8,
        height: 6,
        type: "info",
        userData: {
            fn: "createFormReport"
        },
    }
];

var availableReports = {
}


//create reports
var ReportFactory = {
	createFormReport: function( fPeriod ){
    fPeriod.hide();
    fAutoReload.hide();
    var form_config = {
        type  : "<form>",
        attr  : {
          class : "col-md-12 form-horizontal",
          style : "margin-top: 20px",
          id    : "ssh-form"
        },
        children : [{
          type  : "<input>",
          label : "Probe ID",
          attr : {
            id          : "probe-id",
            name        : "probe-id",
            class       : "form-control",
            placeholder : "probe id",
            required    : true,
          }
        },{
          type  : "<input>",
          label : "SSH Host Address",
          attr : {
            id          : "ssh-address",
            name        : "ssh-address",
            class       : "form-control",
            placeholder : "ip addresss",
            required    : true,
          }
        },{
          type : "<input>",
          label: "SSH Username",
          attr : {
            id          : "ssh-username",
            name        : "ssh-username",
            class       : "form-control",
            placeholder : "ssh username",
            required    : true,
          }
        },{
          type  : "<textarea>",
          label : "SSH Key",
          attr : {
            id          : "ssh-key",
            name        : "ssh-key",
            class       : "form-control",
            placeholder : "ssh key",
            rows        : 8,
            required    : true,
          }
        },
        {
          type: "<div>",
          children : [
            {
              type: "<input>",
              attr: {
                type    : "submit",
                class   : "btn btn-primary pull-right",
                style   : "width: 100px",
                value   : "Save",
                id      : "saveBtn",
              }
            }
          ]
        }]
      };

    $("#system-content" ).html( MMTDrop.tools.createForm( form_config ) ) ;

    //when user submit form
    $("#ssh-form").validate({
      errorClass  : "text-danger",
      errorElement: "span",
      rules: {
        "ssh-address" : {ipv4: true},
        "ssh-username": {
          required: {
            depends: function( el ){
              return $("#ssh-address").val() != "localhost";
            }
          }
        },
        "ssh-key": {
          required: {
            depends: function( el ){
              return $("#ssh-address").val() != "localhost";
            }
          }
        }
      },
      //when the form was valided
      submitHandler : function( form ){
        var data = {
            probe_id : $("#probe-id").val(),
            address  : $("#ssh-address").val(),
            username : $("#ssh-username").val(),
            password : $("#ssh-key").val(),
        };

        MMTDrop.tools.ajax("/info/probe/add", data, "POST", {
          error  : function(){
            MMTDrop.alert.error("Cannot add new Probe", 5*1000);
          },
          success: function(){
            MMTDrop.alert.success("Successfully add the Probe", 3*1000);
            setTimeout( function(){
              MMTDrop.tools.gotoURL( "/chart/" + page.id );
            }, 5000 )
          }
        })
        return false;
      }
    });
	},//end createBackupFormReport
}



//show hierarchy URL parameters on toolbar
$( function(){
  breadcrumbs.setData( [
    'Add new Probe'
  ] );
});
