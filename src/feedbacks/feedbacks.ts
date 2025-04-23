import {
	combineRgb,
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	CompanionOptionValues
} from '@companion-module/base'
import type { ZowietekInstance } from '../index.js'
import { outputResolutionChoices } from '../modules/constants.js'
import { ConsoleLog } from '../modules/logger.js'
import {
	LogLevel,
	ZowieStatus,
	OutputResolution,
	AudioBitrate_ID,
	AudioCodec_ID,
	AudioInputType_ID,
	AudioOutputType_ID,
	AudioSampleRate_ID
} from '../modules/enums.js'
import { getZowieStatusLabel } from '../helpers/commonHelpers.js'

export enum FeedbackId {
	getOutputInfo = 'getOutputInfo',
	getAudioConfig = 'getAudioConfig',
	getDeviceTime = 'getDeviceTime',
	getTally = 'getTally',
	getRecordingStatus = 'getRecordingStatus'
}

export function UpdateFeedbacks(instance: ZowietekInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {
		[FeedbackId.getOutputInfo]: {
			name: 'Output Info',
			type: 'boolean',
			description: 'Feedback based on the output settings (resolution, audio, loop out).',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0)
			},
			showInvert: true,
			options: [
				{
					id: 'format',
					type: 'dropdown',
					label: 'Output Resolution',
					choices: outputResolutionChoices,
					default: outputResolutionChoices[0]?.id
				},
				{
					id: 'audio_switch',
					type: 'dropdown',
					label: 'Audio',
					choices: [
						{ id: '0', label: 'Mute' },
						{ id: '1', label: 'Unmute' }
					],
					default: '0'
				},
				{
					id: 'loop_out_switch',
					type: 'dropdown',
					label: 'Loop Out',
					choices: [
						{ id: '0', label: 'Output' },
						{ id: '1', label: 'Loop Out' }
					],
					default: '0'
				}
			],
			learn: async (feedback, context) => {
				const request = await instance.api.getOutputInfo()
				if (
					request.status === ZowieStatus.Successful ||
					request.status === ZowieStatus.ModificationSuccessful
					) {
					ConsoleLog(instance, `Learn Output Info: ${JSON.stringify(request.data)}`, LogLevel.DEBUG)
					return {
						...feedback.options,
						format: request.data.format,
						audio_switch: request.data.audio_switch.toString(),
						loop_out_switch: request.data.loop_out_switch.toString()
					}
				} else {
					ConsoleLog(instance, `Failed to learn Output Info: ${getZowieStatusLabel(request.status)}`, LogLevel.ERROR)
					return undefined
				}
			},
			callback: async (feedback, context) => {
				const desiredFormat = feedback.options.format as OutputResolution
				const desiredAudio = feedback.options.audio_switch as string
				const desiredLoop = feedback.options.loop_out_switch as string

				if (instance.constants.outputInfo?.format === undefined || 
					instance.constants.outputInfo?.audio_switch === undefined || 
					instance.constants.outputInfo?.loop_out_switch === undefined) {
					return false
				}

				if (
					instance.constants.outputInfo?.format === desiredFormat &&
					instance.constants.outputInfo?.audio_switch.toString() === desiredAudio &&
					instance.constants.outputInfo?.loop_out_switch.toString() === desiredLoop
				) {
					return true
				} else {
					return false
				}
			}
		},
		[FeedbackId.getAudioConfig]: {
			name: 'Audio Config',
			type: 'boolean',
			description: 'Feedback based on audio configuration settings.',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(128, 0, 128)
			},
			showInvert: true,
			options: [
				{
					id: 'ai_type',
					type: 'dropdown',
					label: 'Audio Input Type',
					choices: [
						{ id: AudioInputType_ID.LINE_IN, label: 'Line In' },
						{ id: AudioInputType_ID.INTERNAL_MIC, label: 'Internal MIC' },
						{ id: AudioInputType_ID.HDMI_IN, label: 'HDMI IN' }
					],
					default: '0'
					},
					{
					id: 'switch',
					type: 'dropdown',
					label: 'Audio Switch',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' }
					],
					default: '1'
					},
					{
					id: 'codec',
					type: 'dropdown',
					label: 'Audio Codec',
					choices: [
						{ id: AudioCodec_ID.AAC, label: 'AAC' },
						{ id: AudioCodec_ID.MP3, label: 'MP3' },
						{ id: AudioCodec_ID.G711A, label: 'G.711A' }
					],
					default: '0'
					},
					{
					id: 'bitrate',
					type: 'dropdown',
					label: 'Audio Bitrate',
					choices: [
						{ id: AudioBitrate_ID.BR_32000, label: '32000' },
						{ id: AudioBitrate_ID.BR_48000, label: '48000' },
						{ id: AudioBitrate_ID.BR_64000, label: '64000' },
						{ id: AudioBitrate_ID.BR_96000, label: '96000' },
						{ id: AudioBitrate_ID.BR_128000, label: '128000' }
					],
					default: '0'
					},
					{
					id: 'sample_rate',
					type: 'dropdown',
					label: 'Audio Sample Rate',
					choices: [
						{ id: AudioSampleRate_ID.SR_8000, label: '8000' },
						{ id: AudioSampleRate_ID.SR_16000, label: '16000' },
						{ id: AudioSampleRate_ID.SR_32000, label: '32000' },
						{ id: AudioSampleRate_ID.SR_44100, label: '44100' },
						{ id: AudioSampleRate_ID.SR_48000, label: '48000' }
					],
					default: '3'
					},
					{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: '1', label: 'Mono' },
						{ id: '2', label: 'Stereo' }
					],
					default: '2'
					},
					{
					id: 'volume',
					type: 'number',
					label: 'Volume (0-100)',
					min: 0,
					max: 100,
					default: 100,
					step: 1,
					required: true
					},
					{
					id: 'ao_devtype',
					type: 'dropdown',
					label: 'Audio Output Type',
					choices: [
						{ id: AudioOutputType_ID.LINEOUT, label: 'Line Out' },
						{ id: AudioOutputType_ID.HDMI, label: 'HDMI' }
					],
					default: '1'
					}
			],
			learn: async (feedback, context) => {
				const request = await instance.api.getAudioConfig();
				if (
				request.status === ZowieStatus.Successful ||
				request.status === ZowieStatus.ModificationSuccessful
				) {
					ConsoleLog(instance, `Learn Audio Config: ${JSON.stringify(request.all)}`, LogLevel.DEBUG)
					return {
						...feedback.options,
						ai_type: request.all.ai_type.selected_id.toString(),
						switch: request.all.switch.toString(),
						codec: request.all.codec.selected_id.toString(),
						bitrate: request.all.bitrate.selected_id.toString(),
						sample_rate: request.all.sample_rate.selected_id.toString(),
						channel: request.all.channel.toString(),
						volume: request.all.volume,
						ao_devtype: request.all.ai_devid.toString()
					}
				} else {
					ConsoleLog(instance, `Failed to learn Audio Config: ${getZowieStatusLabel(request.status)}`, LogLevel.ERROR)
					return undefined
				}
			},
			callback: async (feedback, context) => {
				const desiredAI = feedback.options.ai_type as AudioInputType_ID
				const desiredSwitch = feedback.options.switch as string
				const desiredCodec = feedback.options.codec as AudioCodec_ID
				const desiredBitrate = feedback.options.bitrate as AudioBitrate_ID
				const desiredSampleRate = feedback.options.sample_rate as AudioSampleRate_ID
				const desiredChannel = feedback.options.channel as string
				const desiredVolume = Number(feedback.options.volume)
				const desiredAO = feedback.options.ao_devtype as AudioOutputType_ID

				if (instance.constants.audioConfig?.ai_type === undefined || 
					instance.constants.audioConfig?.switch === undefined ||
					instance.constants.audioConfig?.codec === undefined ||
					instance.constants.audioConfig?.bitrate === undefined ||
					instance.constants.audioConfig?.sample_rate === undefined ||
					instance.constants.audioConfig?.channel === undefined ||
					instance.constants.audioConfig?.volume === undefined ||
					instance.constants.audioConfig?.ao_devtype === undefined) {
					return false
				}

				if (
					instance.constants.audioConfig?.ai_type === desiredAI &&
					instance.constants.audioConfig?.switch === desiredSwitch &&
					instance.constants.audioConfig?.codec.toString() === desiredCodec &&
					instance.constants.audioConfig?.bitrate.toString() === desiredBitrate &&
					instance.constants.audioConfig?.sample_rate.toString() === desiredSampleRate &&
					instance.constants.audioConfig?.channel.toString() === desiredChannel &&
					instance.constants.audioConfig?.volume === desiredVolume &&
					instance.constants.audioConfig?.ao_devtype.toString() === desiredAO
				) {
					return true
				} else {
					return false
				}
			}
		},

		[FeedbackId.getDeviceTime]: {
			name: 'Device Time',
			type: 'boolean',
			description: 'Feedback for current device time.',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 128)
			},
			showInvert: true,
			options: [
				{
					id: 'device_time',
					type: 'textinput',
					label: 'Device Time (ISO)',
					default: '2025-03-01T12:00:00Z'
				}
			],
			learn: async (feedback, context) => {
				const request = await instance.api.getDeviceTime()
				if (
          request.status === ZowieStatus.Successful ||
          request.status === ZowieStatus.ModificationSuccessful
        ) {
					const dt = request.data.time;
					// Reconstruct ISO string from individual properties
					const iso = new Date(Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second)).toISOString();
					ConsoleLog(instance, `Learn Device Time: ${iso}`, LogLevel.DEBUG)
					return { ...feedback.options, device_time: iso }
				} else {
					ConsoleLog(instance, `Failed to learn Device Time: ${getZowieStatusLabel(request.status)}`, LogLevel.ERROR)
					return undefined
				}
			},
			callback: async (feedback, context) => {
				const desiredTime = feedback.options.device_time as string

				if (instance.constants.deviceTime?.iso === undefined) {
					return false
				}
				
				if (desiredTime === instance.constants.deviceTime?.iso) {
					return true;
				} else {
					return false;
				}
			}
		},
		[FeedbackId.getTally]: {
			name: 'Tally',
			type: 'boolean',
			description: 'Feedback based on tally settings.',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 165, 0)
			},
			showInvert: true,
			options: [
				{
					id: 'color_id',
					type: 'dropdown',
					label: 'Tally Color',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'Red' },
						{ id: '2', label: 'Green' },
						{ id: '3', label: 'Blue' }
					],
					default: '1'
				},
				{
					id: 'mode_id',
					type: 'dropdown',
					label: 'Mode',
					choices: [
						{ id: '0', label: 'Auto' },
						{ id: '1', label: 'Manual' }
					],
					default: '0'
				}
			],
			learn: async (feedback, context) => {
				const request = await instance.api.getTallyParameters()
				if (
				request.status === ZowieStatus.Successful ||
				request.status === ZowieStatus.ModificationSuccessful
				) {
					ConsoleLog(instance, `Learn Tally: ${JSON.stringify(request.data)}`, LogLevel.DEBUG)
					return {
						...feedback.options,
						color_id: request.data.color_id.toString(),
						mode_id: request.data.mode_id.toString()
					}
				} else {
					ConsoleLog(instance, `Failed to learn Tally: ${getZowieStatusLabel(request.status)}`, LogLevel.ERROR)
					return undefined
				}
			},
			callback: async (feedback, context) => {
				const desiredColor = feedback.options.color_id as string
				const desiredMode = feedback.options.mode_id as string

				if (instance.constants.tally?.color_id === undefined || 
					instance.constants.tally?.mode_id === undefined) {
					return false
				}
				
				if (
					instance.constants.tally?.color_id.toString() === desiredColor &&
					instance.constants.tally?.mode_id.toString() === desiredMode
				) {
					return true
				} else {
					return false
				}
			}
		},
		[FeedbackId.getRecordingStatus]: {
			name: 'Recording Status',
			type: 'boolean',
			description: 'Feedback based on the status of a recording task.',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0)
			},
			showInvert: true,
			options: [
				{
					id: 'recording_status',
					type: 'dropdown',
					label: 'Recording Status',
					choices: [
						{ id: '0', label: 'Not Recording' },
						{ id: '1', label: 'Recording' },
						{ id: '2', label: 'Recording Paused' },
						{ id: '3', label: 'The storage device is full and cannot record' },
						{ id: '4', label: 'Storage device is invalid/not mounted' },
						{ id: '5', label: 'No signal source' }
					],
					default: '0'
				}
			],
			learn: async (feedback, context) => {
				const request = await instance.api.getRecordingTaskList()
				if (
					request.status === ZowieStatus.Successful ||
					request.status === ZowieStatus.ModificationSuccessful
				) {
					ConsoleLog(instance, `Learn Recording Tasks: ${JSON.stringify(request.data)}`, LogLevel.DEBUG)
					// Save tasks list so that callback can later verify the status.
					instance.constants.recordingTasks = request.data
					// Update the dropdown choices for tasks:
					const taskChoices = request.data.map((t: any) => ({ id: t.index, label: t.name }))
					return {
						...feedback.options,
						task_index: taskChoices.length > 0 ? taskChoices[0].id : ''
						// Note: Some companion modules allow dynamically updating choices.
					}
				} else {
					ConsoleLog(instance, `Failed to learn Recording Tasks: ${getZowieStatusLabel(request.status)}`, LogLevel.ERROR)
					return undefined
				}
			},
			callback: async (feedback, context) => {
				const desiredStatus = feedback.options.recording_status as string
				const desiredTaskIndex = feedback.options.task_index as string
		
				if (!instance.constants.recordingTasks) {
					return false
				}
				// Find the task with the matching index.
				const task = instance.constants.recordingTasks.find((t: any) => t.index === desiredTaskIndex)
				if (!task) {
					return false
				}
				// Compare the task status with the desired status.
				return task.status.toString() === desiredStatus
			}
		}
	}
	instance.setFeedbackDefinitions(feedbacks)
}
