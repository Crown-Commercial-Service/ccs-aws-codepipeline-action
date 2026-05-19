import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.unstable_mockModule('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn()
}))

jest.unstable_mockModule('@aws-sdk/client-codepipeline', () => ({
  CodePipelineClient: jest.fn(),
  StartPipelineExecutionCommand: jest.fn()
}))

const core = await import('@actions/core')
const { CodePipelineClient, StartPipelineExecutionCommand } =
  await import('@aws-sdk/client-codepipeline')
const { triggerAWSCodePipeline } =
  await import('../src/trigger-aws-codepipeline.js')

describe('triggerAWSCodePipeline', () => {
  let mockSend: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockSend = jest
      .fn()
      .mockResolvedValue({ pipelineExecutionId: 'fake-execution-id-123' })
    ;(CodePipelineClient as jest.Mock).mockImplementation(() => ({
      send: mockSend
    }))
  })

  it('should send the command WITH variables if branch name is provided', async () => {
    await triggerAWSCodePipeline(
      'eu-west-2',
      'key',
      'secret',
      'cmp-pipeline',
      'feature-branch'
    )

    expect(CodePipelineClient).toHaveBeenCalledWith({
      region: 'eu-west-2',
      credentials: {
        accessKeyId: 'key',
        secretAccessKey: 'secret'
      }
    })

    expect(StartPipelineExecutionCommand).toHaveBeenCalledWith({
      name: 'cmp-pipeline',
      variables: [
        {
          name: 'TargetBranch',
          value: 'feature-branch'
        }
      ]
    })

    expect(mockSend).toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(
      'AWS CodePipeline triggered successfully'
    )
    expect(core.info).toHaveBeenCalledWith(
      'The following execution ID was returned'
    )
    expect(core.info).toHaveBeenCalledWith('fake-execution-id-123')
    expect(core.setOutput).toHaveBeenCalledWith(
      'pipelineExecutionId',
      'fake-execution-id-123'
    )
  })

  it('should send the command WITHOUT variables if branchName is blank', async () => {
    await triggerAWSCodePipeline(
      'eu-west-2',
      'key',
      'secret',
      'cmp-pipeline',
      ''
    )

    expect(StartPipelineExecutionCommand).toHaveBeenCalledWith({
      name: 'cmp-pipeline'
    })
  })

  it('should send the command WITHOUT variables if branchName is completely omitted', async () => {
    await triggerAWSCodePipeline('eu-west-2', 'key', 'secret', 'cmp-pipeline')

    expect(StartPipelineExecutionCommand).toHaveBeenCalledWith({
      name: 'cmp-pipeline'
    })
  })

  it('should handle AWS SDK errors and mark the action as failed', async () => {
    const mockAwsError = new Error('Invalid pipeline name')

    mockSend.mockRejectedValue(mockAwsError)

    await triggerAWSCodePipeline(
      'eu-west-2',
      'key',
      'secret',
      'cmp-pipeline',
      'main'
    )

    expect(core.setFailed).toHaveBeenCalledWith(mockAwsError)
  })
})
