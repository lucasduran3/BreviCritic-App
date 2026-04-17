import type { Config } from 'jest'
import { createDefaultEsmPreset } from 'ts-jest'

const presetConfig = createDefaultEsmPreset()

const jestConfig: Config = {
  ...presetConfig,
  testEnvironment: 'node',
}

export default jestConfig