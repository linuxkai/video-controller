window.addEventListener('message', function (e) {  // 监听 message 事件

	// 加载主题
	if (e.data.colorTheme) {
		themeTitleEle = document.getElementById('ID-change-theme-dropdown').querySelector("span")
		if (e.data.colorTheme == 'light') {
			themeTitleEle.textContent = "浅色主题"
			changeTheme("light");
		}
		if (e.data.colorTheme == 'dark') {
			themeTitleEle.textContent = "深色主题"
			changeTheme("dark");
		}
		if (e.data.colorTheme == 'auto') {
			themeTitleEle.textContent = "跟随系统"
			changeTheme("auto");
		}
	}


	layui.use(function () {
		let table = layui.table,
			layer = layui.layer,
			form = layui.form,
			dropdown = layui.dropdown,
			$ = layui.$;


		dropdown.render({
			elem: '#ID-change-theme-dropdown', // 绑定元素选择器，此处指向 class 可同时绑定多个元素
			align: "center",
			trigger: "hover",
			data: [
				{
					title: '浅色主题',
					id: 100
				},
				{
					title: '深色主题',
					id: 101
				},
				{
					title: '跟随系统',
					id: 102
				}],
			click: function (obj) {
				this.elem.find('span').text(obj.title);
				switch (obj.id) {
					case 100:
						changeTheme("light")
						window.parent.postMessage({ "colorTheme": "light" }, "*");
						break;
					case 101:
						changeTheme("dark")
						window.parent.postMessage({ "colorTheme": "dark" }, "*");
						break;
					case 102:
						changeTheme("auto")
						window.parent.postMessage({ "colorTheme": "auto" }, "*");
						break;
				}
			}
		});

		// 跳过片头片尾表格渲染
		table.render({
			elem: "#ID-skip-head-and-end-table",
			size: "lg",
			cols: [[
				{
					field: 'domain',
					title: "域名",
					width: '30%',
					edit: 'text',
					rowspan: 2
				},
				{
					field: 'startDuration',
					title: "片头时间",
					width: '20%',
					align: "center",
					edit: 'text',
					colspan: 2,
				},
				{
					field: 'endDuration',
					title: "片尾时间",
					width: '20%',
					align: "center",
					edit: 'text',
					colspan: 2,
				},
				{
					field: 'isSkip',
					title: "是否启用",
					width: '10%',
					rowspan: 2,
					templet: '<div><input type="checkbox" name="isSkip" value="{{= d.isSkip }}" title="是|否" lay-skin="switch" lay-filter="templet-skip-head-and-end-status" {{= d.isSkip == 1 ? "checked" : "" }}></div>'
				},
				{
					field: 'toolbar',
					title: "操作",
					rowspan: 2,
					templet: '<div class="layui-clear-space"><a class="layui-btn layui-btn-xm" lay-event="clone">克隆</a><a class="layui-btn layui-btn-xm layui-bg-red" lay-event="delete">删除</a></div>'
				}
			],
			[
				{
					field: 'startMinute',
					title: "分钟",
					width: '10%',
					align: "center",
					edit: 'text',
					templet: '<div class="table-number-cell">{{d.startMinute}}</div>'
				},
				{
					field: 'startSecond',
					title: "秒",
					width: '10%',
					align: "center",
					edit: 'text',
					templet: '<div class="table-number-cell">{{d.startSecond}}</div>'
				},
				{
					field: 'endMinute',
					title: "分钟",
					width: '10%',
					align: "center",
					edit: 'text',
					templet: '<div class="table-number-cell">{{d.endMinute}}</div>'
				},
				{
					field: 'endSecond',
					title: "秒",
					width: '10%',
					align: "center",
					edit: 'text',
					templet: '<div class="table-number-cell">{{d.endSecond}}</div>'
				}
			]],
			toolbar: "#toolbar",
			defaultToolbar: false,
			data: e.data.skipHeadAndEndRules || [],
			done: function (res, curr, count) {

				let tableData = res.data;

				// 状态开关操作
				form.on('switch(templet-skip-head-and-end-status)', function (obj) {
					let index = $(obj.elem).closest('tr').data('index')
					tableData = table.cache['ID-skip-head-and-end-table']
					if (obj.elem.checked) {
						tableData[index].isSkip = 1
						this.value = 1
					} else {
						tableData[index].isSkip = 0
						this.value = 0
					}
				});

				// 单元格工具栏事件
				table.on('tool(filter-skip-head-and-end-table)', function (obj) {
					// 根据不同的事件名进行相应的操作
					switch (obj.event) { // 对应模板元素中的 lay-event 属性值
						case 'clone':
							let oldData = table.cache['ID-skip-head-and-end-table'];
							tableData.splice(obj.index, 0, obj.data);
							table.renderData('ID-skip-head-and-end-table');
							break;
						case 'delete':
							layer.confirm('确定删除吗？', function (index) {
								obj.del(); // 删除对应行（tr）的 DOM 结构，并更新缓存
								layer.close(index);
							});
							break;
					};
				});

				// 单元格编辑事件
				table.on('edit(filter-skip-head-and-end-table)', function (obj) {
					// 值的校验
					if (obj.value.replace(/\s/g, '') === '') {
						layer.tips('值不能为空!', this, { tips: [1, '#ff5722'] });
						return obj.reedit();
					}


					if (["startMinute", "startSecond", "endMinute", "endSecond"].indexOf(obj.field) != -1) {

						// 校验编辑框是否为数字
						let re = /^[0-9]*$/;
						if (!re.test(obj.value)) {
							layer.tips('请0-59区间的输入数字！', this, { tips: [1, '#ff5722'] });
							return obj.reedit();
						}

						if (obj.value < 0 || obj.value > 59) {
							layer.tips('请0-59区间的输入数字！', this, { tips: [1, '#ff5722'] });
							return obj.reedit();
						}


						if (obj.value.startsWith("0")) {
							obj.value = parseInt(obj.value)
						}
					}


					// 修改表格缓存数据
					tableData[obj.index][obj.field] = obj.value
				});

				//表格头部工具栏事件
				table.on('toolbar(filter-skip-head-and-end-table)', function (obj) {
					switch (obj.event) {
						case 'saveRule':
							window.parent.postMessage({ "skipHeadAndEndRules": table.cache['ID-skip-head-and-end-table'] }, "*");
							layer.msg("规则保存成功！", { icon: 0 });
							break;
						case 'addRule':
							tableData = table.cache['ID-skip-head-and-end-table']
							tableData.push({
								"domain": "",
								"startMinute": "",
								"startSecond": "",
								"endMinute": "",
								"endSecond": "",
								"isSkip": 1,
							});
							table.renderData('ID-skip-head-and-end-table');
							break;
					}
				});

				// done end
			}
		});

		// 跳过中间段落规则表格渲染
		table.render({
			elem: "#ID-skip-midsegment-table",
			size: "lg",
			cols: [[
				{
					field: 'domain',
					title: "域名",
					width: '30%',
					edit: 'text',
					rowspan: 2
				},
				{
					field: 'startDuration',
					title: "起始时间",
					width: '30%',
					align: "center",
					edit: 'text',
					colspan: 2,
				},
				{
					field: 'duration',
					title: "跳过时长 (单位:秒)",
					width: '20%',
					align: "center",
					edit: 'text',
					rowspan: 2,
				},
				{
					field: 'isSkip',
					title: "是否启用",
					width: '10%',
					rowspan: 2,
					templet: '<div><input type="checkbox" name="isSkip" value="{{= d.isSkip }}" title="是|否" lay-skin="switch" lay-filter="templet-skip-midsegment-status" {{= d.isSkip == 1 ? "checked" : "" }}></div>'
				},
				{
					field: 'toolbar',
					title: "操作",
					rowspan: 2,
					templet: '<div class="layui-clear-space"><a class="layui-btn layui-btn-xm" lay-event="clone">克隆</a><a class="layui-btn layui-btn-xm layui-bg-red" lay-event="delete">删除</a></div>'
				}
			],
			[
				{
					field: 'startMinute',
					title: "分钟",
					width: '10%',
					align: "center",
					edit: 'text',
					templet: '<div class="table-number-cell">{{d.startMinute}}</div>'
				},
				{
					field: 'startSecond',
					title: "秒",
					width: '10%',
					align: "center",
					edit: 'text',
					templet: '<div class="table-number-cell">{{d.startSecond}}</div>'
				}
			]],
			toolbar: "#toolbar",
			defaultToolbar: false,
			data: e.data.skipMidsegmentRules || [],
			done: function (res, curr, count) {
				let tableData = res.data;

				// 状态开关操作
				form.on('switch(templet-skip-midsegment-status)', function (obj) {
					let index = $(obj.elem).closest('tr').data('index');
					tableData = table.cache['ID-skip-midsegment-table'];
					if (obj.elem.checked) {
						tableData[index].isSkip = 1
						this.value = 1
					} else {
						tableData[index].isSkip = 0
						this.value = 0
					}
				});

				// 单元格工具栏事件
				table.on('tool(filter-skip-midsegment-table)', function (obj) {
					// 根据不同的事件名进行相应的操作
					switch (obj.event) { 
						case 'clone':
							let oldData = table.cache['ID-skip-midsegment-table'];
							tableData.splice(obj.index, 0, obj.data);
							table.renderData('ID-skip-midsegment-table');
							break;
						case 'delete':
							layer.confirm('确定删除吗？', function (index) {
								obj.del(); 
								layer.close(index);
							});
							break;
					};
				});

				// 单元格编辑事件
				table.on('edit(filter-skip-midsegment-table)', function (obj) {
					// 值的校验
					if (obj.value.replace(/\s/g, '') === '') {
						layer.tips('值不能为空!', this, { tips: [1, '#ff5722'] });
						return obj.reedit();
					}

					if (["startMinute", "startSecond"].indexOf(obj.field) != -1) {

						// 校验编辑框是否为数字
						let re = /^[0-9]*$/;
						if (!re.test(obj.value)) {
							layer.tips('请0-59区间的输入数字！', this, { tips: [1, '#ff5722'] });
							return obj.reedit();
						}

						if (obj.value < 0 || obj.value > 59) {
							layer.tips('请0-59区间的输入数字！', this, { tips: [1, '#ff5722'] });
							return obj.reedit();
						}


						if (obj.value.startsWith("0")) {
							obj.value = parseInt(obj.value)
						}
					}


					// 修改表格缓存数据
					tableData[obj.index][obj.field] = obj.value
				});

				//表格头部工具栏事件
				table.on('toolbar(filter-skip-midsegment-table)', function (obj) {
					switch (obj.event) {
						case 'saveRule':
							window.parent.postMessage({ "skipMidsegmentRules": table.cache['ID-skip-midsegment-table'] }, "*");
							layer.msg("规则保存成功！", { icon: 0 });
							break;
						case 'addRule':
							tableData = table.cache['ID-skip-midsegment-table']
							tableData.push({
								"domain": "",
								"startMinute": "",
								"startSecond": "",
								"duration": "",
								"isSkip": 1,
							});
							table.renderData('ID-skip-midsegment-table');
							break;
					}
				});

				// done end
			}
		});
	});
});




function changeTheme(theme) {

	switch (theme) {
		case "light":
			// 切换浅色主题
			document.getElementById('layui-theme-css').removeAttribute('href');
			break;
		case "dark":
			// 切换深色主题
			document.getElementById('layui-theme-css').setAttribute('href', '../layui/css/layui-theme-dark.css');
			break;
		case "auto":
			// 跟随系统主题自动切换
			let darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			if (darkThemeMediaQuery.matches) {
				changeTheme("dark")
			} else {
				changeTheme("light")
			}

			darkThemeMediaQuery.addEventListener('change', function (e) {
				if (e.matches) {
					changeTheme("dark")
				} else {
					changeTheme("light")
				}
			});
			break;

	}
}