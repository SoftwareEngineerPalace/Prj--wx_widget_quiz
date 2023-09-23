<template>
	<view class="base">

		<!-- 上部按钮 -->
		<!-- <view class="topBar">
			<u-textarea autoHeight class="initime__input" v-model="initTimeRaw" placeholder="请输入起始时间"></<u-textarea>
			<button class="initime__ok" @click="onConfirmInitTime">确定</button>
			<button class="btn-now" @click="setNowForStart">设定当前为起始时间</button>
			<button class="btn-add" @click="addOne">新增</button>
		</view> -->

		<!-- 拖拽容器 -->
		<view class="bottom-container">
			<view class="wrapper" ref="listRef">
				<view class="container" v-for="(item, index) in list" :key="item.id">
					<view class="deadline">{{ `${item.deadline}` }}</view>
					<u-textarea class="name" :autoSize="{ minRows: 1, maxRows: 6 }" :style="{
              color: colorMap.get(item.priority),
            }" v-model:value="item.name" placeholder="任务" @blur="onBlur">
					</u-textarea>
					<!-- <u-radio-group v-model:value="item.priority" @change="priorityChanged" class="priority-group">
						<u-radio :value="3">高</u-radio>
						<u-radio :value="2">中</u-radio>
						<u-radio :value="1">低</u-radio>
					</u-radio-group>
					<u-radio-group v-model:value="item.duration" @change="onDurationChange" class="duration-group">
						<u-radio :value="10">10</u-radio>
						<u-radio :value="20">20</u-radio>
						<u-radio :value="30">30</u-radio>
						<u-radio :value="40">40</u-radio>
						<u-radio :value="60">60</u-radio>
						<u-radio :value="90">90</u-radio>
					</u-radio-group> -->

					<button class="delete" @click="onDelete(index)">删</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted, toRaw, nextTick, Ref } from "vue";
	import dayjs from "dayjs";
	import { formatTime, generateUUID } from '../../common/utils';

	const colorMap = new Map(Object.entries({
		3: "#FF6B6B",
		2: "#FF9F1C",
		1: "#4ECDC4",
	}));

	const listRef = ref(null);
	// let hostname = window.location.hostname;

	const onBlur = () => {
		window.scrollTo(0, 0);
	}

	onMounted(async () => {
		// const raw = await fetch(`http://${hostname}:3000/api/getLife`).then(
		// 	(response) => response.json()
		// );
		const raw = null;
		if (!!raw) {
			list.value = raw;
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
					};
				});
			console.log("onMounted");
			update();
		}

		// new Sortable(listRef.value, {
		// 	onEnd: (evt) => {
		// 		const picked = JSON.parse(JSON.stringify(list.value[evt.oldIndex]));
		// 		list.value[evt.oldIndex].delete = true;
		// 		let newList = list.value
		// 			.slice(0, evt.newIndex)
		// 			.concat(picked)
		// 			.concat(list.value.slice(evt.newIndex))
		// 			.filter((v) => !v.hasOwnProperty("delete"))
		// 			.map((v) => toRaw(v));
		// 		list.value = newList;
		// 		console.log("Sortable");
		// 		update();
		// 	},
		// });
	});

	/** 方法 1 */
	const addOne = () => {
		const one = {
			name: "任务",
			duration: 10,
			deadline: "",
			priority: 1,
			id: generateUUID(),
		};
		list.value.push(one);
		console.log("addOne");
		update();
	};

	/** 方法 2 */
	const initTime = ref(8 * 60 + 30);
	const initTimeRaw : Ref<string> = ref("8:30");
	/** 确认了初始时间 */
	const onConfirmInitTime = () => {
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
		initTimeRaw.value = `${hour > 9 ? hour : "0" + hour}:${nextTenMin !== 0 ? nextTenMin * 10 : "00"
			}`;
		console.log("setNowForStart");
		update();
	};

	/** 优先级更新了 */
	const priorityChanged = () => {
		console.log("priorityChanged");
		update();
	};

	/** 时长更新了 */
	const onDurationChange = () => {
		console.log("onDurationChange");
		update();
	};

	/** 被删除了 */
	const onDelete = (index : number) => {
		list.value = list.value.slice(0, index).concat(list.value.slice(index + 1));
		console.log("onDelete");
		update();
	};

	const update = () => {
		console.log("update");
		list.value = list.value.sort((a : { priority : number }, b : { priority : number }) => toRaw(b).priority - toRaw(a).priority);
		nextTick(() => {
			updateDeadline();
			save();
		});
	};

	/** 更新 deadline */
	const updateDeadline = () => {
		console.log("updateDeadline");
		let pre = initTime.value;
		list.value = list.value.map((cur : any) => {
			cur.deadline = formatTime(pre + cur.duration);
			pre += cur.duration;
			return cur;
		});
	};

	/** 保存 */
	const save = async () => {
		console.log("准备保存的数据", list.value);
		// const res = await fetch(`${origin}:3000/api/saveLife`, {
		// 	method: "POST",
		// 	body: JSON.stringify(list.value),
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// });
		// console.log("保存接口的返回结果", res);
	};

	const list = ref<any>([]);
</script>

<style scoped lang="scss">
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
			justify-content: flex-start;
			align-items: center;
			margin: 20px 0 20px 0;
			flex-grow: 0;

			.initime__input {
				width: 30%;
				text-align: center;
			}

			.initime__ok {
				width: 20%;
			}

			.btn-now {
				align-self: flex-end;
			}

			.btn-add {
				align-self: center;
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
				align-items: center;
				width: 100vw;
				padding-right: 10vw;
				margin-bottom: 15vh;

				.container {
					width: 90vw;
					display: flex;
					justify-content: space-between;
					align-items: center;
					border-bottom: 1px gainsboro dashed;

					.priority-group {
						display: flex;
						flex-direction: column;
					}

					.duration-group {
						display: grid;
						grid-template-columns: repeat(2, 1fr);
					}

					.deadline {
						margin-left: 10px;
						font-size: 20px;
						white-space: nowrap;
						color: chocolate;
					}

					.name {
						text-align: center;
						color: white;
						margin-right: 10px;
						margin-left: 10px;
						font-weight: 500;
						background: #eeeeee;
						padding: 0;
						text-align: center;
						width: 150px;
						white-space: wrap;
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
</style>