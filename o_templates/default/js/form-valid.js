/*
* @autor sgb004
* @version 1.0
*/

function FormValidate( form, o ){
	this.fieldParent = 'form-group';
	this.fieldErroresContainer = 'alerts-container';
	this.errorTheme = '<div class="alert alert-dismissable alert-danger">{{ msg }}</div>';
	this.errorClass = '.alert';
	this.notices = {
		empty: 'Es un campo requerido',
		minlength: 'El mínimo de caracteres es de ',
		maxlength: 'El máximo de caracteres es de '
	};
	this.errorsList = {};
	this.listeners = {};
	this.errorParents = {};
	
	this.data = {};
	this.useAjax = false;
	this.dataType = 'json';
	this.sending = false;

	this.form = form;
	this.fields = this.form.querySelectorAll( '*[name]' );
	this.init( this );
	return this;
}

FormValidate.prototype = {
	init: function( _this ){
		var i, parent, field;
		var fields = this.fields;
		var preErrors = this.form.querySelectorAll( this.errorClass );

		this.form.setAttribute( 'novalidate', 'novalidate' );
		this.fields = {};

		for( i=0; i<preErrors.length; i++ ){
			parent = preErrors[i];
			do{
				parent = parent.parentNode;
				tag = parent.tagName.toLowerCase();
			} while ( !parent.classList.contains( this.fieldParent ) && tag != 'form' );
			field = parent.querySelector('input, select, textarea');
			if( field != null && field != undefined ){
				if( this.errorsList[ field.name ] == undefined ){
					this.errorsList[ field.name ] = [];
				}
				this.errorsList[ field.name ].push( preErrors[i] );
			}
		}

		for( i=0; i<fields.length; i++ ){
			this.addField( fields[ i ] );
		}


		this.form.onsubmit = function( e ){
			e.preventDefault();
			_this.submit();
		}
	},
	addField( field ){
		var _this = this;
		var type = field.tagName;
		type = type.toLowerCase();

		if( type == 'input' ){
			type = field.type.toLowerCase();
		}

		if( type != 'submit' && this.fields[ field.name ] == undefined ){
			if( type == 'hidden' ){
				field['validate'] = function(){
					return true;
				}
			} else if( type == 'radio' ){
				var j;
				var inputs = this.form.querySelectorAll( 'input[name="'+field.name+'"]' );
				for( j=0; j<inputs.length; j++ ){
					inputs[ j ].addEventListener('change', function(){
						_this.clearErrorField( this.name );
					}, false);
				}
				field['validate'] = function(){
					var isValid = true;
					var required = this.getAttribute( 'required' );
					if( required != null && required != undefined ){
						var checked = this.form.querySelector( 'input[name="'+this.name+'"]:checked' );
						if( checked == null || checked == undefined ){
							isValid = false;
							_this.addErrorField( this.name, _this.notices.empty );
						}
					}

					return _this.applyListenerField( this.name, isValid );
				};
			} else if ( type == 'select' ){
				field['validate'] = function(){
					var isValid = true;
					var required = this.getAttribute( 'required' );
					if( required != null && required != undefined && ( this.value == '' || this.value == null || this.value == undefined ) ){
							isValid = false;
							_this.addErrorField( this.name, _this.notices.empty );
					}
					return _this.applyListenerField( this.name, isValid );
				}
				field.addEventListener( 'change', function(){
					_this.clearErrorField( this.name );
					this.validate();
				});
			} else {
				field['validate'] = function(){
					var isValid = true;
					var required = this.getAttribute( 'required' );
					var value = this.value;
					var pattern = this.getAttribute( 'data-pattern' );
					var minlength = this.getAttribute('minlength');
					var maxlength = this.getAttribute('maxlength');

					if( required != null && required != undefined ){
						value = value.trim();
						if( value == '' ){
							isValid = false;
							_this.addErrorField( this.name, _this.notices.empty );
						}
					}

					if( (pattern != null || pattern != undefined) && value != '' ){
						pattern = new RegExp( pattern );
						if( !pattern.test( value ) ){
							_this.addErrorField( this.name, this.getAttribute('data-pattern-error') );
							isValid = false;
						}
					}

					if( minlength != null || minlength != undefined ){
						minlength = parseInt( minlength );
						if( isNaN( minlength ) ){
							minlength = 0;
						}
						if( minlength > 0 && value.length < minlength ){
							_this.addErrorField( this.name, _this.notices.minlength+minlength );
							isValid = false;
						}
					}

					if( maxlength != null || maxlength != undefined ){
						maxlength = parseInt( maxlength );
						if( isNaN( maxlength ) ){
							maxlength = 0;
						}
						if( maxlength > 0 && value.length < maxlength ){
							_this.addErrorField( this.name, _this.notices.maxlength+maxlength );
							isValid = false;
						}
					}

					return _this.applyListenerField( this.name, isValid );
				};
				field.addEventListener( 'change', function(){
					_this.clearErrorField( this.name );
					this.validate();
				});
			}

			this.fields[ field.name ] = field;
		}
	},
	submit: function( e ){
		if( !this.sending ){
			var field, fieldIsValid, parent;
			var isValid = true;
			this.clearAllErrors();
			for( field in this.fields ){
				fieldIsValid = this.fields[field].validate();
				if( !fieldIsValid ){
					isValid = false;
				}
			}
			if( isValid ){
				var _this = this;
				if( this.useAjax ){
					this.sending = true;
					this.getData();
					this.fieldsDisabled();
					$.ajax({
						type: this.form.method,
						url: this.form.action,
						data: this.data,
						dataType: this.dataType
					})
					.done(function(data){
						_this.sending = false;
						_this.fieldsEnabled();

						if( typeof data.fields == 'object' ){
							for( field in data.fields ){
								if( typeof data.fields[field] == 'object' || typeof data.fields[field] == 'array' ){
									for( i in data.fields[field] ){
										_this.addErrorField( field, data.fields[field][i] );
									}
								}
							}
						}

						_this.onDone( data );
					})
					.fail(function( data, status ){
						_this.sending = false;
						_this.fieldsEnabled();
						_this.onFail( data.responseText );
					});
				}else{
					this.form.onsubmit = null;
					this.form.submit();
					this.form.onsubmit = function( e ){
						e.preventDefault();
						_this.submit();
					}	
				}
			}
		}
	},
	addErrorField: function( field, notice ){
		if( this.fields[field] != undefined ){
			var parent = this.fields[field];
			var tag, errorsContainer;
			var errorContainer = document.createElement('div'); this.errorTheme;
			errorContainer.innerHTML = this.errorTheme.replace('{{ msg }}', notice);
			errorContainer = errorContainer.childNodes[0];

			if( this.errorsList[ field ] == undefined ){
				this.errorsList[ field ] = [];
			}

			this.errorsList[ field ].push( errorContainer );

			parent = this.applyErrorParent( field, parent, notice );

			if( parent != null ){
				do {
					parent = parent.parentNode;
					tag = parent.tagName.toLowerCase();
				} while ( !parent.classList.contains( this.fieldParent ) && tag != 'body' );
				errorsContainer = parent.querySelector( this.fieldErroresContainer );

				if( errorsContainer != null && errorsContainer != undefined ){
					errorsContainer.appendChild( errorContainer );
				}else{
					parent.appendChild( errorContainer );
					parent.appendChild( errorContainer );
				}
			}
		}
	},
	clearAllErrors: function(){
		var field;
		for( field in this.errorsList ){
			this.clearErrorField( field );
		}
		this.errorsList = {};
	},
	clearErrorField: function( field ){
		if( this.errorsList[field] != undefined ){
			var i;
			for( i=0; i<this.errorsList[field].length; i++){
				this.errorsList[field][ i ].parentNode.removeChild( this.errorsList[field][ i ] );
			}
			this.errorsList[field] = [];
		}
	},
	validateField: function( field ){
		this.clearErrorField( field );
		this.fields[field].validate();
	},
	addListenerField: function( field, fn ){
		this.listeners[ field ] = fn;
	},
	applyListenerField: function( field, isValid){
		if( this.listeners[ field ] != undefined ){
			isValid = this.listeners[ field ]( this, isValid );
		}
		return isValid;
	},
	applyErrorParent: function( field, parent, notice ){
		if( this.errorParents[ field ] != undefined ){
			parent = this.errorParents[ field ]( this, parent, notice );
		}
		return parent;
	},
	addErrorParent: function( field, parent ){
		this.errorParents[ field ] = parent;
	},
	getData: function(){
		var field;
		this.data = null;
		this.data = {};
		for( field in this.fields ){
			this.data[ field ] = this.fields[field].value;
		}
	},
	fieldsDisabled: function(){
		var field;
		for( field in this.fields ){
			this.fields[field].setAttribute( 'disabled', 'disabled' );
		}
	},
	fieldsEnabled: function(){
		var field;
		for( field in this.fields ){
			this.fields[field].removeAttribute( 'disabled' );
		}
	},
	onDone: function( data ){
	},
	onFail: function( data ){
		console.log( data );
		this.addErrorField( '__token', 'Ocurrió un error al enviar la información' );
	}
};