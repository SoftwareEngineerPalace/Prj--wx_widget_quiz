<template>
	<view>
		<view class="base">
			<!-- 上部按钮 -->
			<view class="topBar">
				<u-textarea autoHeight class="initime__input" v-model="initTimeRaw" placeholder="请输入起始时间" />
				<button type="default" class="initime__ok" @click="onConfirmInitTime">确定</button>
				<button type="primary" class="btn-now" @click="setNowForStart">设定当前为起始时间</button>
				<button type="warn" class="btn-add" @click="addOne">新增</button>
			</view>

			<!-- 拖拽容器 -->
			<view class="bottom-container">
				<view class="wrapper" ref="listRef">
					<view class="container" v-for="(item, index) in list" :key="item.id">

						<!-- 截止时间 -->
						<view class="deadline" :style="{color: colorDic[item.priority]}">{{ `${item.deadline}` }}</view>

						<!-- 任务名字 -->
						<u-textarea :customStyle="{marginLeft:'8px', width:'100px'}" class="task__input" autoHeight
							v-model="item.name" placeholder="任务">
						</u-textarea>

						<!-- 选择优先级 -->
						<view :style="{marginLeft:'8px'}">
							<u-radio-group :customStyle="{marginLeft:'8px'}" size='10px' v-model="item.priority"
								@change="priorityChanged" class="priority-group" placement="column">
								<u-radio iconSize="12" labelSize="12px" :key="3" :label="3" :name="3" shape="square"
									:customStyle="{marginRight: '8px'}">高</u-radio>
								<u-radio labelSize="12px" :key="2" :label="2" :name="2" shape="square"
									:customStyle="{marginRight: '8px'}">中</u-radio>
								<u-radio labelSize="12px" :key=" 1" :label="1" :name="1" shape="square"
									:customStyle="{marginRight: '8px'}">低</u-radio>
							</u-radio-group>
						</view>

						<!-- 选择工作时长 -->
						<view class="container-duraion">
							<u-radio-group size='10px'
								:customStyle="{ backgroundColor:'blue', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'}"
								v-model="item.duration" @change="onDurationChange" class="duration-group">

								<u-radio labelSize="12px" :key="10" :name="10" :label="10" shape="square"
									:customStyle="{marginRight: '4px'}">10</u-radio>
								<u-radio labelSize="12px" :key="20" :name="20" :label="20" shape="square"
									:customStyle="{marginRight: '4px'}">20</u-radio>

								<u-radio labelSize="12px" :key="30" :name="30" :label="30" shape="square"
									:customStyle="{marginRight: '4px'}">30</u-radio>

								<u-radio labelSize="12px" :key="40" :name="40" :label="40" shape="square"
									:customStyle="{marginRight: '4px'}">40</u-radio>

								<u-radio labelSize="12px" :key="60" :name="60" :label="60" shape="square"
									:customStyle="{marginRight: '4px'}">60</u-radio>
								<u-radio labelSize="12px" :key="90" :name="90" :label="90" shape="square"
									:customStyle="{marginRight: '4px'}">90</u-radio>
							</u-radio-group>
						</view>

						<!-- 多个按钮 -->
						<view class="container-action">
							<button class="btn delete" @click="onDelete(index)">删</button>
							<button class="btn up" @click="moveUp(index)" v-if="index !== 0">上</button>
							<button class="btn down" @click="moveDown(index)"
								v-if="index !== list.length - 1">下</button>
						</view>

						<!-- 复盘 -->
						<u-textarea :customStyle="{marginLeft:'8px', width:'100px', marginRight:'20rpx'}"
							class="task__input" autoHeight v-model="item.review" placeholder="复盘">
						</u-textarea>

					</view>
				</view>
			</view>

			<u-toast ref="uToast"></u-toast>
		</view>
		<u-loading-page color="#4cd964" loading-color="#4cd964" icon-size="40" font-size="40" class="loading"
			bg-color="#bbbbbb00" loading-text="正在执行" :loading="showLoading"></u-loading-page>
	</view>
</template>

<script lang="ts" setup>
	import dayjs from "dayjs";
	import { formatTime, generateUUID, ITask } from '../../common/utils';
	import { ref, onMounted, Ref, toRaw } from 'vue'

	const colorDic = ref({
		"3": "#FF6B6B",
		"2": "#FF9F1C",
		"1": "#4ECDC4",
	});

	const listRef = ref(null);
	const initTime : Ref<number> = ref(8 * 60 + 30);
	const initTimeRaw = ref("8:30");
	const list = ref([]);
	const showLoading = ref(false);

	onMounted(() => {
		getTask();
	})

	const getTask = async () => {
		const rsp : any = await wx.cloud.callFunction({
			name: 'getTasks',
		});
		const raw = rsp.result.data;
		console.log('getTasks', raw);
		if (!!raw) {
			list.value = raw;
			console.log("getTask init", toRaw(list.value));
		} else {
			list.value = Array(3)
				.fill(1)
				.map(() => {
					return {
						id: generateUUID(),
						name: "任务",
						duration: 10,
						deadline: "",
						priority: 1,
						review: ''
					};
				});
			console.log("onMounted");
			update();
		}
	};

	const addOne = () => {
		console.log("addOne start", toRaw(list.value));
		showLoading.value = true;
		const one : ITask = {
			name: "任务",
			duration: 10,
			deadline: "",
			priority: 1,
			id: generateUUID(),
			review: ''
		};
		list.value.push(one);
		console.log("addOne", toRaw(list.value));
		update();
	};

	/** 确认了初始时间 */
	const onConfirmInitTime = () => {
		showLoading.value = true;
		const a = initTimeRaw.value.split(":");
		const b = initTimeRaw.value.split("：");
		const times = a.length === 2 ? a : b;
		const h = parseInt(times[0]);
		const m = parseInt(times[1]);
		initTime.value = h * 60 + m;
		console.log("initTimeRaw");
		update();
	};

	/** 设置当前为开始 */
	const setNowForStart = () => {
		showLoading.value = true;
		const now = dayjs(); // 获取当前时间
		let hour = now.hour(); // 获取当前时间的小时部分
		const minute = now.minute(); // 获取当前时间的分钟部分

		const quotient = Math.floor(minute / 10);
		const remainder = minute / 10;
		let nextTenMin = remainder === 0 ? quotient : quotient + 1;
		if (nextTenMin === 6) {
			hour++;
			nextTenMin = 0;
		}
		if (hour === 24) {
			hour = 0;
		}

		initTime.value = hour * 60 + nextTenMin * 10;
		initTimeRaw.value = `${hour > 9 ? hour : "0" + hour}:${nextTenMin !== 0 ? nextTenMin * 10 : "00"}`;
		console.log("setNowForStart", initTimeRaw.value);
		update();
	};

	/** 优先级更新了 */
	const priorityChanged = () => {
		showLoading.value = true;
		console.log("priorityChanged");
		update();
	};

	/** 时长更新了 */
	const onDurationChange = () => {
		showLoading.value = true;
		console.log("onDurationChange");
		update();
	};

	/** 被删除了 */
	const onDelete = (index : number) => {
		showLoading.value = true;
		const _list = toRaw(list.value);
		list.value = _list.slice(0, index).concat(_list.slice(index + 1));
		console.log("onDelete");
		update();
	};

	const moveUp = (index : number) => {
		if (index === 0) return;
		showLoading.value = true;
		const temp = list.value[index];
		list.value[index] = list.value[index - 1];
		list.value[index - 1] = temp;
		update()
	};

	const moveDown = (index : number) => {
		if (index === list.value.length - 1) return;
		showLoading.value = true;
		const temp = list.value[index];
		list.value[index] = list.value[index + 1];
		list.value[index + 1] = temp;
		update()
	};

	const update = () => {
		// console.log("update");
		list.value = toRaw(list.value).sort((a : { priority : number }, b : { priority : number }) => b.priority - a.priority);
		// setTimeout(() => {
		// 	updateDeadline();
		// 	save();
		// }, 300);
		updateDeadline();
		save();
	};

	/** 更新 deadline */
	const updateDeadline = () => {
		// console.log("updateDeadline start");
		let pre = initTime.value;
		list.value = toRaw(list.value).map((cur : any) => {
			cur.deadline = formatTime(pre + cur.duration);
			pre += cur.duration;
			return cur;
		});
		// console.log("updateDeadline", toRaw(list.value));
	};

	/** 保存 */
	const save = async () => {
		const _list = toRaw(list.value);
		console.log("start addTasks", _list);
		const rsp : any = await wx.cloud.callFunction({
			name: 'addTasks',
			data: { list: _list }
		})
		console.log('保存数据后的回调', rsp);
		const result = rsp.errMsg === "cloud.callFunction:ok";
		if (result) {
			uni.showToast({
				title: "更新成功",
				icon: "none",
				duration: 1000
			})
			showLoading.value = false;
		}
	};

	const onBlur = () => {
		console.log('移动到最上面');
	}
</script>

<style scoped lang="scss">
	.loading {
		z-index: 1000;
	}

	.vue-ref {
		z-index: 1000;
	}

	.base {
		width: 100vw;
		color: black;
		height: 100vh;
		display: flex;
		justify-content: flex-start;
		flex-direction: column;

		.topBar {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			margin: 20px 0 20px 0;
			flex-grow: 0;
			font-size: 14px;

			.initime__input {
				text-align: center;
				font-size: 14px;
				width: 50px;
			}

			.initime__ok {
				font-size: 14px;
			}

			.btn-now {
				font-size: 14px;
			}

			.btn-add {
				font-size: 14px;
			}
		}

		.bottom-container {
			width: 100vw;
			display: flex;
			flex-direction: column;
			overflow-y: scroll;
			flex-grow: 1;

			.wrapper {
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: stretch;
				width: 100vw;
				padding-right: 10vw;
				margin-bottom: 15vh;

				.container {
					width: 100vw;
					display: flex;
					justify-content: space-between;
					align-items: center;
					border-bottom: 1px gainsboro dashed;

					.container-duraion {
						width: auto;
					}

					.priority-group {
						display: flex;
						flex-direction: column;
						margin-left: 30px;
					}

					.duration-group {
						display: grid;
						grid-template-columns: repeat(2, 1fr);
					}

					.deadline {
						margin-left: 10px;
						white-space: nowrap;
						color: chocolate;
						font-size: 14px;
					}

					.task__input {
						text-align: center;
						color: white;
						margin-right: 10rpx;
						margin-left: 30rpx;
						font-weight: 500;
						background: #eeeeee;
						padding: 0;
						text-align: center;
						width: 150rpx;
						white-space: wrap;
						color: red;
					}



					.container-action {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						align-items: center;

						.btn {
							width: 25px;
							flex-shrink: 0;
							font-size: 10px;
							text-align: center;
							letter-spacing: 0;
							margin-right: 5px;
							padding: 0;
						}
					}

					.delete {
						width: 25px;
						flex-shrink: 0;
						font-size: 10px;
						text-align: center;
						letter-spacing: 0;
						margin-right: 5px;
						padding: 0;
					}
				}
			}
		}
	}

	.container-duraion {
		:deep(.u-radio-group) {
			display: grid !important;
			grid-template-columns: 1fr 1fr !important;
			flex: none !important; // 如果不想加 !important 怎么办
		}
	}
</style>