<template>
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
					<u-textarea :customStyle="{marginLeft:'8px', width:'100px'}" class="name" autoHeight
						v-model="item.name" placeholder="任务" @blur="onBlur">
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
							:customStyle="{ backgroundColor:'blue', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)'}"
							v-model="item.duration" @change="onDurationChange" class="duration-group">
							<u-grid :col="3">
								<u-grid-item>
									<u-radio labelSize="12px" :key="10" :name="10" :label="10" shape="square"
										:customStyle="{marginRight: '4px'}">10</u-radio>
								</u-grid-item>
								<u-grid-item>
									<u-radio labelSize="12px" :key="20" :name="20" :label="20" shape="square"
										:customStyle="{marginRight: '4px'}">20</u-radio>
								</u-grid-item>
								<u-grid-item>
									<u-radio labelSize="12px" :key="30" :name="30" :label="30" shape="square"
										:customStyle="{marginRight: '4px'}">30</u-radio>
								</u-grid-item>
								<u-grid-item>
									<u-radio labelSize="12px" :key="40" :name="40" :label="40" shape="square"
										:customStyle="{marginRight: '4px'}">10</u-radio>
								</u-grid-item>
								<u-grid-item>
									<u-radio labelSize="12px" :key="60" :name="60" :label="60" shape="square"
										:customStyle="{marginRight: '4px'}">20</u-radio>
								</u-grid-item>
								<u-grid-item>
									<u-radio labelSize="12px" :key="90" :name="90" :label="90" shape="square"
										:customStyle="{marginRight: '4px'}">30</u-radio>
								</u-grid-item>
							</u-grid>
						</u-radio-group>
					</view>

					<!-- 删除按钮 -->
					<view class="container-action">
						<button class="btn delete" @click="onDelete(index)">删</button>
						<button class="btn up" @click="moveUp(index)" v-if="index !== 0">上</button>
						<button class="btn down" @click="moveDown(index)" v-if="index !== list.length - 1">下</button>
					</view>

				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	declare const wx : any;

	import dayjs from "dayjs";
	import { formatTime, generateUUID } from '../../common/utils';

	interface ITask {
		id : string;
		deadline : string;
		name : string;
		priority : number;
		duration : number;
	}

	interface IData {
		list : ITask[];
		[prop : string] : unknown;
	}

	export default {
		data() : IData {
			return {
				colorDic: {
					"3": "#FF6B6B",
					"2": "#FF9F1C",
					"1": "#4ECDC4",
				},
				listRef: null,
				initTime: 8 * 60 + 30,
				initTimeRaw: "8:30",
				list: []
			}
		},
		mounted() {
			this.getTask();
		},
		methods: {
			async getTask() {
				const rsp : any = await wx.cloud.callFunction({
					name: 'getTask',
				});
				const raw = rsp.result.data;
				console.log('getTask', raw);
				if (!!raw) {
					this.list = raw;
				} else {
					this.list = Array(3)
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
					this.update();
				}
			},
			addOne() {
				const one = {
					name: "任务",
					duration: 10,
					deadline: "",
					priority: 1,
					id: generateUUID(),
				};
				this.list.push(one);
				console.log("addOne");
				this.update();
			},
			/** 确认了初始时间 */
			onConfirmInitTime() {
				const a = this.initTimeRaw.split(":");
				const b = this.initTimeRaw.split("：");
				const times = a.length === 2 ? a : b;
				const h = parseInt(times[0]);
				const m = parseInt(times[1]);
				this.initTime = h * 60 + m;
				console.log("initTimeRaw");
				this.update();
			},

			/** 设置当前为开始 */
			setNowForStart() {
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

				this.initTime = hour * 60 + nextTenMin * 10;
				this.initTimeRaw = `${hour > 9 ? hour : "0" + hour}:${nextTenMin !== 0 ? nextTenMin * 10 : "00"}`;
				console.log("setNowForStart", this.initTimeRaw);
				this.update();
			},

			/** 优先级更新了 */
			priorityChanged() {
				console.log("priorityChanged");
				this.update();
			},

			/** 时长更新了 */
			onDurationChange() {
				console.log("onDurationChange");
				this.update();
			},

			/** 被删除了 */
			onDelete(index : number) {
				this.list = this.list.slice(0, index).concat(this.list.slice(index + 1));
				console.log("onDelete");
				this.update();
			},
			moveUp(index : number) {
				if (index === 0) return;
				const temp = this.list[index];
				this.list[index] = this.list[index - 1];
				this.list[index - 1] = temp;
				this.update()
			},
			moveDown(index : number) {
				if (index === this.list.length - 1) return;
				const temp = this.list[index];
				this.list[index] = this.list[index + 1];
				this.list[index + 1] = temp;
				this.update()
			},
			update() {
				console.log("update");
				this.list = this.list.sort((a : { priority : number }, b : { priority : number }) => b.priority - a.priority);
				setTimeout(() => {
					this.updateDeadline();
					this.save();
				}, 300);
			},

			/** 更新 deadline */
			updateDeadline() {
				console.log("updateDeadline");
				let pre = this.initTime;
				this.list = this.list.map((cur : any) => {
					cur.deadline = formatTime(pre + cur.duration);
					pre += cur.duration;
					return cur;
				});
			},

			/** 保存 */
			async save() {
				const _list = this.list;
				console.log("准备保存的数据", _list);
				const rsp : any = await wx.cloud.callFunction({
					name: 'addTask',
					data: { list: _list }
				})
				console.log('保存数据后的回调', rsp);
			},
			onBlur() {
				console.log('移动到最上面');
			}
		}
	}
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
						width: 40%;
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

					.name {
						text-align: center;
						color: white;
						margin-right: 10px;
						margin-left: 30px;
						font-weight: 500;
						background: #eeeeee;
						padding: 0;
						text-align: center;
						width: 150px;
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
</style>