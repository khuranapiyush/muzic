export const getPlayerEventInfo = (player, config = { data: {} }) => {
  let {
    category,
    name,
    playerType,
    mode,
    videoTimeStamp,
    muted,
    volume,
    watchId,
    videoId = null,
    userId,
    duration,
    initialResolution,
    userAgent,
    networkType,
    dataSpeed,
    ipAddress,
    dataSaver,
    shortieId = null
  } = config.data

  return {
    type: category,
    name,
    playerType,
    mode: 'normal',
    volume,
    muted,
    videoTimeStamp,
    videoDuration: duration,
    resolution: `${initialResolution?.width}X${initialResolution?.height}`,
    currentResolution: `${initialResolution?.width}X${initialResolution?.height}`,
    videoPlaySource: '',
    userId,
    userAgent,
    watchId,
    videoId: videoId || null,
    shortieId: shortieId || null,
    networkType: networkType ? { string: networkType } : null,
    dataSpeed: dataSpeed ? { int: dataSpeed } : null,
    dataSaver: dataSaver ? { boolean: dataSaver } : null,
    timeStamp: Date.now(),
    deviceIp: ipAddress || null
  }
}

export const getKafkaSchema = (events, key) => {
  const kafkaSchema = {
    value_schema_id: 45,
    key_schema_id: 1,
    records: [
      {
        key,
        value: {
          ...events[0]
        }
      }
    ]
  }

  // console.log(
  //   '🚀 ~ file: playerEvent.js:77 ~ getKafkaSchema ~ kafkaSchema:',
  //   JSON.stringify(kafkaSchema, null, 2)
  // )

  return kafkaSchema
}
