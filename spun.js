;(function($){

var Spun = function(){
	if(typeof this.constructed === 'function'){
		this.constructed.apply(this, arguments);
	}
};

Spun.prototype = {
	constructed: function($input, sts){
		this.$input = $input;
		this.sts = sts;
		this.min = Number($input.attr('min'));
		this.max = Number($input.attr('max'));
		this.step = Number($input.attr('step')) || 1;
		this.id = $input.attr('id');
		this.oVal = '';
		this.tout = null;
		this.intval = null;
		this.static = Spun;
		
		this.wrap();
		this.bindEvents();
	},
	wrap: function(){
		var $input = this.$input,
			sts = this.sts,
			$prent;
		
		$input.wrap(
			'<div class="jq-spun-wrap' + ($input.is(':disabled') ? ' jq-spun-disabled' : '') + (sts.customClass ? ' ' + sts.customClass : '') + '"' +
			(this.id ? ' id="' + this.id + '_jqspun"' : '') + ' />'
		);
		$prent = $input.parent();
		
		$prent.html(
			'<div class="jq-spun-input" />' +
			'<div class="jq-spun-btns">' +
				'<div class="jq-spun-btn-inc-wrap"><button class="jq-spun-btn-inc">'+sts.incBtnText+'</button></div>' +
				'<div class="jq-spun-btn-dec-wrap"><button class="jq-spun-btn-dec">'+sts.decBtnText+'</button></div>' +
			'</div>'
		)
		.find('div.jq-spun-input').append($input);
		
		if(sts.method === 'replace'){$input.prop('type', 'text');}
	},
	handleFocus: function(e){
		this.oVal = this.$input.val();
	},
	handleChange: function(e){
		var $input = this.$input,
			val    = $input.val();
		
		if(isNaN(val) || val < this.min || val > this.max){
			$input.val(this.oVal);
		}
	},
	clearTimers: function(e){
		clearTimeout(this.tout);
		clearInterval(this.intval);
		this.static.$doc.unbind('mouseup', this.handleMouseup);
	},
	updateValue: function(delta){
		var $input = this.$input,
			val    = Number($input.val()),
			newVal = val + (delta * this.step);
		
		if(newVal < this.min){
			$input.val(this.min);
			return;
		}else if(newVal > this.max){
			$input.val(this.max);
			return;
		}else if(this.step !== 1 && newVal % this.step !== 0){
			$input.val(this.oVal);
			return;
		}
		
		$input.val(newVal.toFixed(0));
	},
	handleMousedown: function(e){
		var $doc  = this.static.$doc,
			$el   = $(e.target),
			self  = this,
			delta = 1;
		
		if(this.$input.is(':disabled')){return;}
		if($el.hasClass('jq-spun-btn-dec')){delta = -1;}
		
		this.updateValue(delta);
		
		$doc.mouseup($.proxy(this.handleMouseup, this));
		
		this.tout = setTimeout(function(){
			self.intval = setInterval(function(){
				self.updateValue(delta);
			}, 60);
		}, 400);
	},
	handleMouseout: function(e){
		this.clearTimers();
	},
	handleMouseup: function(e){
		this.clearTimers();
	},
	handleKeys: function(e){
		var key = e.keyCode,
			$btn = this.$btns[0];
			
		if(key == 38 || key == 40){
			if(key == 40){$btn = this.$btns[1];}
			this.handleChange();
			this.handleMousedown({target: $btn});
			this.handleMouseup();
			
			e.preventDefault();
		}
	},
	bindEvents: function(){
		var $input = this.$input;
		this.$btns = $input.parent().next().find('button');
		
		$input
			.focus($.proxy(this.handleFocus, this))
			.blur($.proxy(this.handleChange, this))
			.keydown($.proxy(this.handleKeys, this));
			
		this.$btns
			.mousedown($.proxy(this.handleMousedown, this))
			.mouseout($.proxy(this.handleMouseout, this));
	},
	enable: function(){
		this.$input
			.prop('disabled', false)
			.parents('div.jq-spun-wrap')
			.removeClass('jq-spun-disabled');
	},
	disable: function(){
		this.$input
			.prop('disabled', true)
			.parents('div.jq-spun-wrap')
			.addClass('jq-spun-disabled');
	}
};

$.extend(Spun, {
	$doc: $(document),
	supported: false,
	isSupported: function(){
		var i = document.createElement('input');
		i.setAttribute('type', 'number');
		this.supported = i.type !== 'text';
	}
});

Spun.isSupported();

$.spun = function(args){
	if(!arguments.length || typeof args === 'object'){
		args = args || {};
		args.method = 'polyfill';
		$('input[type="number"]').spun(args);
	}else if(typeof args === 'string' && args === 'supported'){
		return Spun.supported;
	}
};

$.spun.count = 0;
$.spun.instance = {};

$.fn.spun = function(args){
	var sts = {
		method: 'polyfill',
		customClass: '',
		incBtnText: '+',
		decBtnText: '-'
	};
			
	var methods = {
		handleEnableDisable: function(method){
			this.each(function(){
				$.spun.instance[$.data(this, 'spunid')][method]();
			});
		},
		init: function(){
			$.extend(sts, args || {});
			
			this.each(function(){
				var $this = $(this);
				
				if(Spun.supported && sts.method == 'polyfill' || typeof $.data(this, 'spunid') != 'undefined'){
					return;
				}
				
				$.spun.instance[$.spun.count] = new Spun($this, sts);
				$.data(this, 'spunid', $.spun.count);
				$.spun.count++;
			});
		}
	};
	
	if(typeof args === 'string'){
		if(args === 'enable' || args === 'disable'){
			methods.handleEnableDisable.call(this, args);
		}
	}else{
		methods.init.call(this);
	}
	
	return this;
};

})(jQuery);