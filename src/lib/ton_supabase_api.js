const SUPABASE = require("@supabase/supabase-js");

const supabaseUrl = "https://api.appbase.online";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impva3FyY2FndXRwbXZwaWxoY2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwNDc2MjEsImV4cCI6MjA0MTYyMzYyMX0.ASxFtj2hYVeT7G00arDoNS9zLy8BzdgsSPFRYJw-62E";
const supabase = SUPABASE.createClient(supabaseUrl, supabaseKey);

// Explore

// 获取公告
export async function getAnnouncement() {
	let { data: announcement, error: announcementError } = await supabase
		.from("announcement")
		.select("comment")
		.order("updated_at", { ascending: false })
		.limit(0, 1);
	if (announcementError) {
		throw announcementError;
	}
	return announcement.length == 0 ? "" : announcement[0].comment;
}

// 获取轮播图
export async function getSlideshow() {
	let { data: slideshow, error: slideshowError } = await supabase
		.from("slideshow")
		.select("id,app_id,image_link")
		.order("update_at", { ascending: false });
		console.log('getSlideshow = ',slideshow,slideshowError)
	if (slideshowError) {
		return [];
	}
	return slideshow;
}

// 获取  奖励app数量 和 奖励task数量
export async function getRewardCount() {
	let res = {
	  rewardAppCount: 0,
	  rewardTaskCount: 0,
	};
	let {
	  data: appData,
	  error: appError,
	  count: appCount,
	} = await supabase
	  .from("app")
	  .select("id", { count: "exact", head: true })
	  .neq("points", 0);
	res.rewardAppCount = appCount;
	// let {
	//   data: taskData,
	//   error: taskError,
	//   count: taskCount,
	// } = await supabase
	//   .from("task")
	//   .select("id", { count: "exact", head: true })
	//   .neq("points", 0);
	// res.rewardTaskCount = taskCount;
	return res;
  }

  export async function taskCountFromCache(page,filename) {
	console.log('taskCountFromCache in = ',filename)
	let time = get3AMTimestamp()
	if (!(filename && filename.length)) {
		filename = 'app_recommend'
	}
	let path = `app-category/${time}/task_count.json`
	console.log('taskCountFromCache path = ',path)
	let apps = localStorage.getItem(path)
	if (apps && apps.length) {
		return JSON.parse(apps)
	}
	let expiresIn = 60
	// const { data:url, error:urlError } = await supabase.storage
	// .from("cache")
	// .createSignedUrl(path,expiresIn)
	const { data:url, error:urlError } = await supabase.storage.from('cache').getPublicUrl(path)
	console.log('taskCountFromCache getPublicUrl = ',url,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.publicUrl)
		console.log('taskCountFromCache response = ',response)
		let data = await response.json()
		console.log('taskCountFromCache download = ',data)
		// for (let i = 0; i < localStorage.length; i++) {
		// 	let key = localStorage.key(i)
		// 	console.log('app-category key = ',key)
		// 	if (key.indexOf("app-category") > -1) {
		// 		localStorage.removeItem(key)
		// 	}
		// }
		// localStorage.setItem(path,JSON.stringify(data))
		// let temp = `app-category/${getLast3AMTimestamp()}/${filename}.json`
		return data;
	} catch (error) {
		console.log('taskCountFromCache error = ',error)
	}
	
	
	// const { data, error } = await supabase.storage.from('cache').download(url.signedUrl)
	// console.log('exploreAppDataFromCache download = ',data)
	// if (error) {
	// 	console.error("exploreAppDataFromCache Error fetching data:", error);
	// 	return;
	// }
	// return [];
}

// 指定数量 最近更新的app
export async function recentUpdate(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1

	let select = supabase
	.from("app")
	.select("id,name,icon,description,caption,is_forward")
	.is('deleted', false)
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let { data, error } = await select.range(offset, size)

	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

// 指定数量 推荐APP的数据
export async function recommandData(page,size) {
	page = page ? page : 1
    size = size ? size : 3
    let offset = (page - 1) * size
    size = offset + size - 1
	console.log('recommandData = ',offset,size)
	let { data, error } = await supabase
	.from("app")
	.select("id,name,icon,description,points,category_id,link,images,appPlatforms,caption,is_forward")
	.is('deleted', false)
	.order("recommend", { ascending: false })
	.order("id", { ascending: false })
	.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

export async function recommandDataFromCache(page,filename) {
	console.log('recommandDataFromCache in = ',filename)
	let time = get3AMTimestamp()
	if (!(filename && filename.length)) {
		filename = 'app_recommend'
	}
	let path = `app-category/${time}/${filename}_${page}.json`
	console.log('recommandDataFromCache path = ',path)
	let apps = localStorage.getItem(path)
	if (apps && apps.length) {
		return JSON.parse(apps)
	}
	let expiresIn = 60
	// const { data:url, error:urlError } = await supabase.storage
	// .from("cache")
	// .createSignedUrl(path,expiresIn)
	const { data:url, error:urlError } = await supabase.storage.from('cache').getPublicUrl(path)
	console.log('recommandDataFromCache getPublicUrl = ',url,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.publicUrl)
		console.log('recommandDataFromCache response = ',response)
		let data = await response.json()
		console.log('recommandDataFromCache download = ',data)
		// for (let i = 0; i < localStorage.length; i++) {
		// 	let key = localStorage.key(i)
		// 	console.log('app-category key = ',key)
		// 	if (key.indexOf("app-category") > -1) {
		// 		localStorage.removeItem(key)
		// 	}
		// }
		// localStorage.setItem(path,JSON.stringify(data))
		// let temp = `app-category/${getLast3AMTimestamp()}/${filename}.json`
		return data;
	} catch (error) {
		console.log('recommandDataFromCache error = ',error)
	}
	
	
	// const { data, error } = await supabase.storage.from('cache').download(url.signedUrl)
	// console.log('exploreAppDataFromCache download = ',data)
	// if (error) {
	// 	console.error("exploreAppDataFromCache Error fetching data:", error);
	// 	return;
	// }
	// return [];
}
// APP的分类
// export async function getCategorys() {
// 	let res = [];
// 	const { data: appTotal, count:appTotalCount, error: appError } = await supabase
// 		.from("app")
// 		.select("*", { count: "exact",head: true });
// 	if (appError) {
// 		console.error("查询错误:", appError);
// 	}
// 	res.push({ name: "All", category_id: "", count: appTotalCount });
// 	const { data: categoryData, error: categoryError } = await supabase
// 		.from("category")
// 		.select("id,title");
// 	if (categoryError) {
// 		console.error("查询错误:", categoryError);
// 	}
// 	let promise = []
// 	for (const category of categoryData) {
// 		let p = new Promise(async (resolve, reject) => {
// 			const { count: categoryCount, error } = await supabase
// 			.from("app")
// 			.select("*", { count: "exact" }) // 获取总数
// 			.eq("category_id", category.id);
// 			if (error) {
// 				resolve({
// 					category_id: category.id,
// 					name: category.title,
// 					count: 0
// 				})
// 				return
// 			}
// 			resolve({
// 				category_id: category.id,
// 				name: category.title,
// 				count: categoryCount
// 			})
// 		})
// 		promise.push(p)
// 	}
// 	let temp = await Promise.all(promise)
// 	res = res.concat(temp)
// 	return res
// }

export async function getCategorys() {
	let res = [];
	const { data: categoryData, error: categoryError } = await supabase
	  .from("category")
	  .select("id,title,countApps")
	  .is('is_show',true);
	if (categoryError) {
	  console.error("查询错误:", categoryError);
	}
	let appTotalCount = 0;
	for (const category of categoryData) {
	  appTotalCount += category.countApps;
	  res.push({
		name: category.title,
		category_id: category.id,
		count: category.countApps,
	  });
	}
	res.unshift({ name: "All", category_id: "app_all", count: appTotalCount });
	return res
  }

// 搜索数据
export async function searchData(name) {
	// console.log('searchData in =',name)
	const searchTerm = `${name}%`; // 匹配以 A 开头的 name
	const { data: searchData, error } = await supabase
		.from("app")
		.select("id, name, icon, description,link,images,appPlatforms,caption,points,is_forward")
		.like("name", searchTerm); // 使用 ilike 实现模糊查询
	// console.log('searchData searchData =',searchData,error)
	if (error) {
		console.error("Error fetching data:", error);
		return [];
	}
	return searchData;
}

// 每个类别的数据
export async function exploreAppData(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1
	let select = supabase
	.from("app")
	.select("id,name,icon,description,points,link,images,appPlatforms,caption,is_forward")
	.is('deleted', false)
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let { data, error } = await select.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

// app的信息数据
export async function getApp(app_id) {
	console.log('getApp in = ',app_id)
	let { data: appInfo, error } = await supabase
		.from("app")
		.select(
			"id,name,is_forward,icon,description,points,category_id,link,images,appPlatforms,caption,category(title)"
		)
		.order("recommend", { ascending: false })
		.eq("id", app_id)
		.single();
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	console.log('getApp appInfo = ',appInfo)
	appInfo.grade = 0;
	appInfo.reviews = 0;
	// 查询app_id在category_id分类下的排名
	const { data: appRankData, error: appRankError } = await supabase
		.from("app")
		.select("id, rating")
		.eq("category_id", appInfo.category_id) // 按 category_id 过滤
		.order("rating", { ascending: false }) // 按 rank 降序排列
		.order('updated_at',{ ascending: false })

	if (appRankError) {
		console.error("查询错误:", appRankError);
		return;
	}
	// // 找到 app_id 的排名
	// const rankPosition = appRankData.findIndex((app) => app.id === app_id) + 1; // 数组下标 + 1 为排名
	// console.log(
	// 	`app_id 为 ${app_id} 在 category_id 为 ${appInfo.category_id} 下的排名为: 第 ${rankPosition} 名`
	// );
	// appInfo.rank = rankPosition;

	const { data: reviews, error: reviewsError } = await supabase
		.from("user_reviews")
		.select("score", { count: "exact" }) // 使用 count 选项获取总条数
		.eq("app_id", app_id);
	if (reviewsError) {
		console.error("查询错误:", error);
	} else if (reviews.length === 0) {
		console.log("not found reviews");
	} else {
		const totalReviews = reviews.length;
		const avgScore =
			reviews.reduce((sum, review) => sum + review.score, 0) / totalReviews;
		console.log(`总评论数: ${totalReviews}`);
		console.log(`平均评分: ${avgScore.toFixed(2)}`);
		appInfo.grade = totalReviews;
		appInfo.reviews = avgScore.toFixed(2);
	}
	return appInfo;
}

function get3AMTimestamp() {
    const now = new Date(); // 当前时间
    const currentHour = now.getHours(); // 当前小时
    const currentMinute = now.getMinutes(); // 当前分钟

    // 创建当天凌晨 3 点的时间
    const today3AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0, 0);

    // 如果当前时间早于凌晨 3:01，取前一天凌晨 3 点
    if (currentHour < 3 || (currentHour === 3 && currentMinute < 1)) {
        today3AM.setDate(today3AM.getDate() - 1); // 前一天
    }

	let timestamp = Math.floor(today3AM.getTime() / 1000);
	timestamp = timestamp - getTimezoneOffsetFromBeijing()
	console.log('get3AMTimestamp = ',now,today3AM,timestamp,getTimezoneOffsetFromBeijing())

    return timestamp
}

function getTimezoneOffsetFromBeijing() {
    const currentDate = new Date();
    const currentOffset = currentDate.getTimezoneOffset(); // 当前时区与 UTC 的偏移（分钟）
	
    const beijingOffset = 8 * 60; // 东八区的偏移（分钟）
    
    let offsetFromBeijing = currentOffset - beijingOffset;
	if (beijingOffset > currentOffset) {
		offsetFromBeijing = beijingOffset + currentOffset
	}
	console.log('getTimezoneOffsetFromBeijing = ',currentOffset,beijingOffset,offsetFromBeijing)
    
    // 返回当前时区与东八区的偏移
    return offsetFromBeijing * 60;
}

export async function exploreAppDataFromCache(filename,page) {
	console.log('exploreAppDataFromCache in = ',filename)
	let time = get3AMTimestamp()
	if (!(filename && filename.length)) {
		filename = 'app_all'
	}
	let path = `app-category/${time}/${filename}_${page}.json`
	console.log('exploreAppDataFromCache path = ',path)
	let apps = localStorage.getItem(path)
	if (apps && apps.length) {
		return JSON.parse(apps)
	}
	let expiresIn = 60
	// const { data:url, error:urlError } = await supabase.storage
	// .from("cache")
	// .createSignedUrl(path,expiresIn)
	const { data:url, error:urlError } = await supabase.storage.from('cache').getPublicUrl(path)
	console.log('exploreAppDataFromCache getPublicUrl = ',url,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.publicUrl)
		console.log('exploreAppDataFromCache response = ',response)
		let data = await response.json()
		console.log('exploreAppDataFromCache download = ',data)
		// for (let i = 0; i < localStorage.length; i++) {
		// 	let key = localStorage.key(i)
		// 	console.log('app-category key = ',key)
		// 	if (key.indexOf("app-category") > -1) {
		// 		localStorage.removeItem(key)
		// 	}
		// }
		// localStorage.setItem(path,JSON.stringify(data))
		// let temp = `app-category/${getLast3AMTimestamp()}/${filename}.json`
		return data;
	} catch (error) {
		console.log('exploreAppDataFromCache error = ',error)
	}
	
	
	// const { data, error } = await supabase.storage.from('cache').download(url.signedUrl)
	// console.log('exploreAppDataFromCache download = ',data)
	// if (error) {
	// 	console.error("exploreAppDataFromCache Error fetching data:", error);
	// 	return;
	// }
	// return [];
}

// MiniAPP

// points_type : 1-app   2-task   3-invite
export const AppPointsEnum = {
	app: 1,
	task: 2,
	invite: 3,
};

export const UserAppStatusEnum = {
	open: 1,
	verify: 2,
};

export async function appRecommandData(recommendAppCount) {
	let res = [];
	let { data: recommandData, error } = await supabase
		.from("app")
		.select("id,name,icon,description,points")
		.order("recommend", { ascending: false })
		.limit(0, recommendAppCount);
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	console.log("Fetched data:", data);
	for (const app of recommandData) {
		let earnRewardTime,
			status = await checkIsEarnAppReward(app.id, AppPointsEnum["app"]);
		let resp = {
			name: app.name,
			icon: app.icon,
			description: app.description,
			points: app.points,
			earnRewardTime: earnRewardTime,
			status: status,
		};
		res.push(resp);
	}
	return res;
}

export async function appGetCategorys() {
	let res = [];
	const { data: appTotalCount, error: appError } = await supabase
		.from("app")
		.select("*", { count: "exact" });
	if (appError) {
		console.error("查询错误:", appError);
	}
	res.push({ name: "All", category_id: "", count: appTotalCount });
	const { data: categoryData, error: categoryError } = await supabase
		.from("category")
		.select("id,title");
	if (categoryError) {
		console.error("查询错误:", categoryError);
	}
	for (const category of categoryData) {
		const { count: categoryCount, error } = await supabase
			.from("app")
			.select("*", { count: "exact" }) // 获取总数
			.eq("category_id", category.id);
		res.push({
			name: category.title,
			category_id: category.id,
			count: categoryCount,
		});
	}
}

export async function appExploreAppData(category_id, limitCount) {
	let res = [];
	let recommandDataArr = [];
	if (category_id == "") {
		let { data: recommandData, error } = await supabase
			.from("app")
			.select("id,name,icon,description,points")
			.order("updated_at", { ascending: false })
			.limit(0, limitCount);
		if (error) {
			console.error("Error fetching data:", error);
			return;
		}
		recommandDataArr = recommandData;
	} else {
		let { data: recommandData, error } = await supabase
			.from("app")
			.select("id,name,icon,description,points")
			.order("updated_at", { ascending: false })
			.eq("category_id", category_id)
			.limit(0, limitCount);
		if (error) {
			console.error("Error fetching data:", error);
			return;
		}
		recommandDataArr = recommandData;
	}
	// 示例：将数据渲染到页面上
	for (const app of recommandDataArr) {
		let earnRewardTime,
			status = await checkIsEarnAppReward(app.id, AppPointsEnum["app"]);
		let resp = {
			name: app.name,
			icon: app.icon,
			description: app.description,
			points: app.points,
			earnRewardTime: earnRewardTime,
			status: status,
		};
		res.push(resp);
	}
	return res;
}

export async function getAppInfo(app_id, user_id) {
	let { data: appInfo, error } = await supabase
		.from("app")
		.select(
			"id,name,icon,description,points,category_id,link,images,appPlatforms"
		)
		.order("recommend", { ascending: false })
		.eq("id", app_id)
		.single();
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	appInfo.grade = 0;
	appInfo.reviews = 0;
	// 查询app_id在category_id分类下的排名
	const { data: appRankData, error: appRankError } = await supabase
		.from("app")
		.select("id, rank")
		.eq("category_id", category_id) // 按 category_id 过滤
		.order("rank", { ascending: false }); // 按 rank 降序排列

	if (appRankError) {
		console.error("查询错误:", error);
		return;
	}
	// 找到 app_id 的排名
	const rankPosition = appRankData.findIndex((app) => app.id === app_id) + 1; // 数组下标 + 1 为排名
	console.log(
		`app_id 为 ${app_id} 在 category_id 为 ${category_id} 下的排名为: 第 ${rankPosition} 名`
	);
	appInfo.rank = rankPosition;

	const { data: reviews, error: reviewsError } = await supabase
		.from("user_reviews")
		.select("score", { count: "exact" }) // 使用 count 选项获取总条数
		.eq("app_id", app_id);
	if (reviewsError) {
		console.error("查询错误:", error);
	} else if (reviews.length === 0) {
		console.log("not found reviews");
	} else {
		const totalReviews = reviews.length;
		const avgScore =
			reviews.reduce((sum, review) => sum + review.score, 0) / totalReviews;
		console.log(`总评论数: ${totalReviews}`);
		console.log(`平均评分: ${avgScore.toFixed(2)}`);
		appInfo.grade = totalReviews;
		appInfo.reviews = avgScore.toFixed(2);
	}
	let earnTime,
		status = await checkIsEarnAppReward(app_id, AppPointsEnum["app"], user_id);
	return appInfo;
}

export async function getTask() {
	let { data: taskInfo, error } = await supabase
		.from("task")
		.select("id,name,icon,points")
		.order("updated_at", { ascending: false });
	return taskInfo;
}

// points_type : 1-app   2-task   3-invite
export async function checkIsEarnAppReward(appId, points_type, userId) {
	let { data: recordData, error } = await supabase
		.from("user_point_record")
		.select("")
		.eq("source_id", appId)
		.eq("points_type", points_type)
		.order("created_at", { ascending: false });
	if (error) {
		console.log("Get app earn reward record data error:", error);
		throw error;
	}
	if (recordData && recordData.length == 0) {
		return 0;
	}
	let plus24HourTimestamp = convertTimestamptzToUnixPlus24Hours(
		recordData[0].created_at
	);
	let currentTimestamp = Date.now();
	let earnTime =
		plus24HourTimestamp > currentTimestamp ? plus24HourTimestamp : 0;
	let { data: userAppData, error: userAppError } = await supabase
		.from("user_app")
		.select("status")
		.eq("user_id", userId)
		.eq("app_id", appId)
		.order("updated_at", { ascending: false });
	let status = UserAppStatusEnum["open"];
	if (
		userAppData.length > 0 &&
		userAppData[0].status == UserAppStatusEnum["verify"]
	) {
		status = UserAppStatusEnum["verify"];
	}
	return earnTime, status;
}

function convertTimestamptzToUnixPlus24Hours(timestamptz) {
	// 将 ISO 字符串转换为 JavaScript Date 对象
	const date = new Date(timestamptz);

	// 获取当前的 Unix 时间戳（秒）
	let unixTimestamp = Math.floor(date.getTime() / 1000);

	// 推迟 24 小时（24 * 60 * 60 秒）
	const SECONDS_IN_A_DAY = 24 * 60 * 60;
	unixTimestamp += SECONDS_IN_A_DAY;

	return unixTimestamp;
}
