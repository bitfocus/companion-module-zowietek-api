import { LogLevel, ZowieStatus } from "../modules/enums.js";
import { ZowietekInstance } from "../index.js";
import { ConsoleLog } from "../modules/logger.js";
import { getZowieStatusLabel } from "../helpers/commonHelpers.js";
import { FeedbackId } from "../feedbacks/feedbacks.js";

export async function fetchData(instance: ZowietekInstance): Promise<void> {
	if (!instance.globalSettings.enableComs || !instance.api || !instance.connected) {
		return;
	}

	const [getOutputInfo, getAudioConfig, getDeviceTime, getTally, getRecordingStatus] = await Promise.all([
		instance.api.getOutputInfo(),
		instance.api.getAudioConfig(),
		instance.api.getDeviceTime(),
		instance.api.getTallyParameters(),
		instance.api.getRecordingTaskList(),
	]);

    //Fetch Output Info
	if (getOutputInfo.status === ZowieStatus.Successful || getOutputInfo.status === ZowieStatus.ModificationSuccessful) {
		//ConsoleLog(instance, `Feedback Output Info: ${JSON.stringify(getOutputInfo.data)}`, LogLevel.DEBUG);
		Object.assign(instance.constants.outputInfo, getOutputInfo.data);
		instance.checkFeedbacks(FeedbackId.getOutputInfo);
	} else {
		ConsoleLog(instance, `Failed to get Output Info: ${getZowieStatusLabel(getOutputInfo.status)}`, LogLevel.ERROR);
	}


    //Fetch Audio Config
	if (getAudioConfig.status === ZowieStatus.Successful || getAudioConfig.status === ZowieStatus.ModificationSuccessful) {
		//ConsoleLog(instance, `Feedback Audio Config: ${JSON.stringify(getAudioConfig.all)}`, LogLevel.DEBUG);
		Object.assign(instance.constants.audioConfig, {
			ai_type: getAudioConfig.all.ai_type.selected_id.toString(),
			switch: getAudioConfig.all.switch.toString(),
			codec: getAudioConfig.all.codec.selected_id.toString(),
			bitrate: getAudioConfig.all.bitrate.selected_id.toString(),
			sample_rate: getAudioConfig.all.sample_rate.selected_id.toString(),
			channel: getAudioConfig.all.channel.toString(),
			volume: getAudioConfig.all.volume,
			ao_devtype: getAudioConfig.all.ai_devid.toString(),
		});

		instance.checkFeedbacks(FeedbackId.getAudioConfig);
	} else {
		ConsoleLog(instance, `Failed to get Audio Config: ${getZowieStatusLabel(getAudioConfig.status)}`, LogLevel.ERROR);
	}

    //Fetch Device Time
	if (getDeviceTime.status === ZowieStatus.Successful || getDeviceTime.status === ZowieStatus.ModificationSuccessful) {
		const dt = getDeviceTime.data.time;
		instance.constants.deviceTime.iso = new Date(Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second)).toISOString();
		instance.checkFeedbacks(FeedbackId.getDeviceTime);
	} else {
		ConsoleLog(instance, `Failed to get Device Time: ${getZowieStatusLabel(getDeviceTime.status)}`, LogLevel.ERROR);
	}

    //Fetch Tally
	if (getTally.status === ZowieStatus.Successful || getTally.status === ZowieStatus.ModificationSuccessful) {
		//ConsoleLog(instance, `Feedback Tally: ${JSON.stringify(getTally.data)}`, LogLevel.DEBUG);
		Object.assign(instance.constants.tally, {
			color_id: getTally.data.color_id.toString(),
			mode_id: getTally.data.mode_id.toString(),
		});
		instance.checkFeedbacks(FeedbackId.getTally);
	} else {
		ConsoleLog(instance, `Failed to get Tally: ${getZowieStatusLabel(getTally.status)}`, LogLevel.ERROR);
	}

	//Fetch Recording Status
	if (getRecordingStatus.status === ZowieStatus.Successful || getRecordingStatus.status === ZowieStatus.ModificationSuccessful) {
		//ConsoleLog(instance, `Feedback Recording Status: ${JSON.stringify(getRecordingStatus.data)}`, LogLevel.DEBUG);
		instance.constants.recordingTasks = getRecordingStatus.data;
		//ConsoleLog(instance, `Recording Tasks updated: ${JSON.stringify(instance.constants.recordingTasks)}`, LogLevel.DEBUG);
		instance.checkFeedbacks(FeedbackId.getRecordingStatus);
	} else {
		ConsoleLog(instance, `Failed to get Recording Status: ${getZowieStatusLabel(getRecordingStatus.status)}`, LogLevel.ERROR);
	}
}