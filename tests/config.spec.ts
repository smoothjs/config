import test from 'japa'
import { join } from 'path'
import { Config } from '../src'
import { existsSync, mkdirSync, rmdirSync, unlinkSync, writeFileSync } from 'fs'

function removeFile(path: string) {
    if (existsSync(path)) {
      unlinkSync(path);
    }
}

const json = JSON.stringify({
    a: {
      b: {
        boolean: false,
        booleanInString: 'false',
        c: 1,
        d: 'FOO_BAR',
        emptyString: ' ',
        number: 1,
        numberInString: '1',
        string: 'hello world',
        trueBooleanInString: 'true',
      }
    }
  });

  const json2 = JSON.stringify({
    a: {
      b: {
        c: 2
      }
    }
  })
  
  const yaml = `a:
  b:
    c: 2
    d: FOO_BAR
`;

const config = new Config()

test.group('Config', (group) => {
    group.beforeEach(() => {
        config.clearCache()
    })

    group.afterEach(() => {
        delete require.cache[join(process.cwd(), 'smoothjs.js')]
        delete require.cache[join(process.cwd(), 'development.js')]

        removeFile('smoothjs.json');
        removeFile('smoothjs.yml');
        removeFile('smoothjs.js');
        removeFile('development.json');
        removeFile('development.yml')
        removeFile('development.js')

        config.clearCache()
    })

    test('call `get` method', async (assert) => {
        config.set('a.b', 2)

        assert.equal(config.get('a.b', 1), 2)
    })

    test('call `remove` method', async (assert) => {
        config.set('a.b', 2)
        config.remove('a.b')

        assert.isUndefined(config.get('a.b', undefined))
    })

    test('yml overrides js', async (assert) => {
        writeFileSync('smoothjs.yml', yaml)
        writeFileSync('smoothjs.js', `module.exports = ${json}`)

        assert.equal(config.get('a.b.c'), 2)
    })

    test('json overrides yml', async (assert) => {
        writeFileSync('smoothjs.json', json)
        writeFileSync('smoothjs.yml', yaml)

        assert.equal(config.get('a.b.c'), 1)
    })

    test('development overriding smoothjs.json', async (assert) => {
        writeFileSync('development.js', `module.exports = ${json2}`)
        writeFileSync('smoothjs.json', json)

        assert.equal(config.get('a.b.c'), 2)
    })
})