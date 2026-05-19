import * as core from '@actions/core'
import {
  CodePipelineClient,
  StartPipelineExecutionCommand,
  StartPipelineExecutionInput
} from '@aws-sdk/client-codepipeline'

const triggerAWSCodePipeline = async (
  awsRegion: string,
  awsAccessKey: string,
  awsSecretKey: string,
  pipelineName: string,
  branchName?: string
): Promise<void> => {
  const client = new CodePipelineClient({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey
    }
  })

  const input: StartPipelineExecutionInput = { name: pipelineName }

  if (branchName) {
    input.variables = [
      {
        name: 'TargetBranch',
        value: branchName
      }
    ]
  }

  const command = new StartPipelineExecutionCommand(input)

  try {
    const response = await client.send(command)

    core.info('AWS CodePipeline triggered successfully')
    core.info('The following execution ID was returned')
    core.info(response.pipelineExecutionId || '')
    core.setOutput('pipelineExecutionId', response.pipelineExecutionId || '')
  } catch (error) {
    core.setFailed(error as Error)
  }
}

export { triggerAWSCodePipeline }
