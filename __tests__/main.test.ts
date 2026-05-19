import { jest, describe, it, expect, beforeEach } from '@jest/globals'

jest.unstable_mockModule('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn()
}))

jest.unstable_mockModule('../src/trigger-aws-codepipeline.js', () => ({
  triggerAWSCodePipeline: jest.fn()
}))

const core = await import('@actions/core')
const { run } = await import('../src/main.js')
const { triggerAWSCodePipeline } =
  await import('../src/trigger-aws-codepipeline.js')

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should read inputs and call triggerAWSCodePipeline', async () => {
    ;(core.getInput as jest.Mock).mockImplementation((name: string) => {
      switch (name) {
        case 'aws-region':
          return 'eu-west-2'
        case 'aws-access-key':
          return 'mock-access-key'
        case 'aws-secret-key':
          return 'mock-secret-key'
        case 'pipeline-name':
          return 'cmp-pipeline'
        case 'target-branch':
          return 'feature-branch'
        default:
          return ''
      }
    })

    await run()

    expect(triggerAWSCodePipeline).toHaveBeenCalledWith(
      'eu-west-2',
      'mock-access-key',
      'mock-secret-key',
      'cmp-pipeline',
      'feature-branch'
    )
  })

  it('should set action to failed if an error is thrown', async () => {
    const errorMessage = 'Something went wrong with AWS'

    ;(triggerAWSCodePipeline as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    )

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(errorMessage)
  })
})
