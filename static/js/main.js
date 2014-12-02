function initUpdaters() {
  var updaters = document.querySelectorAll('.update');
  for(var i=0; i< updaters.length; i++) {
    updaters[i].addEventListener('change',function() {
      var name = this.getAttribute('name');
      var data = [this.getAttribute('id'), this.value, currentValue];
      _site.socket.emit('update',data);
      // $.ajax({
      //   type: "POST",
      //   url: "/api/v1/update",
      //   data: { fieldName : $(this).id,
      //           value : $(this).val()
      //   },
      //   success: function() {
      //     console.log('sucess');
      //   },
      //   dataType: "json"
      // });


    },false);

    updaters[i].addEventListener('focus',function() {
      currentValue = this.value;
    });
  }
}


var d84 = function() {
  _site = this,
  this.initSocket = function() {
    var socket = new io();
    _site.socket = socket;
    socket.on('response',function(data) {
      console.log('SERVER RESPONSE -> ' + data);
      _site.alertSuccess();
    });
  },

  this.initCreateButton = function() {
    var createBtn = document.querySelector('.add-new');
    createBtn.addEventListener('click', function() {
      var field = prompt("Field name");
      if (field != null) {
        var input = document.createElement("input");
        input.type = "text";
        input.name = field;
        input.id = field;
        input.addEventListener('focus',function() {
          currentValue = this.value;
        });
        input.addEventListener('change',function() {
          var name = this.getAttribute('name');
          var data = [this.getAttribute('id'), this.value, currentValue];
          _site.socket.emit('update',data);

        },false);
        area = document.querySelector('.site-info')
        area.appendChild(input);
      }
    },false);
  },

  this.initRemoveButtons = function() {
    var removeBtn = document.querySelectorAll('.remove');
    for (var i=0; i < removeBtn.length; i++) {
      removeBtn[i].addEventListener('click',function() {
        var name = this.getAttribute('name');
        currentValue = this.parentNode.getElementsByTagName('input')[0].value;
        var data = [this.parentNode.getElementsByTagName('input')[0].id, this.parentNode.getElementsByTagName('input')[0].value, currentValue];
        console.log(data);
        _site.socket.emit('remove',data);

      },false);
    }
  },

  this.alertSuccess = function() {
      var alertView = document.querySelector('.alert-success');
      alertView.classList.remove('hide');
      alertView.style.opacity = 1;
      setTimeout(function() {
        alertView.style.opacity = 0;
      }, 1500);
    }
}

window.onload = function() {
  initUpdaters();
  var _site = new d84();

  _site.initSocket();
  _site.initCreateButton();
  _site.initRemoveButtons();
}
