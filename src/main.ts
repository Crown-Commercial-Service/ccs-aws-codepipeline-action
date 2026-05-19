import * as core from '@actions/core'
import { triggerAWSCodePipeline } from './trigger-aws-codepipeline.js'

const run = async (): Promise<void> => {
  try {
    const awsRegion = core.getInput('aws-region')
    const awsAccessKey = core.getInput('aws-access-key')
    const awsSecretKey = core.getInput('aws-secret-key')
    const pipelineName = core.getInput('pipeline-name')
    const targetBranch = core.getInput('target-branch', { required: false })

    await triggerAWSCodePipeline(
      awsRegion,
      awsAccessKey,
      awsSecretKey,
      pipelineName,
      targetBranch
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export { run }
