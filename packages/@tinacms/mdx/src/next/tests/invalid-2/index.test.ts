import { it, expect } from 'vitest'
import { parseMDX } from '../../parse'
import { stringifyMDX } from '../../shortcodes/stringify'
import { field } from './field'
import input from './in.md?raw'
import * as util from '../util'

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v)
  const string = stringifyMDX(tree, field, (v) => v)
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  expect(string).toMatchFile(util.mdPath(__dirname))
})
