import { TinaMarkdown } from './rich-text'
import { tinaField } from './react'
import React, { Suspense, useEffect, useState } from 'react'
import type { TinaMarkdownContent } from './rich-text'

type RenderValue = (args: {
  value: unknown
  keyName: string
  parentValue: object | object[]
  parentKeyName: string
}) => JSX.Element
type RenderRichText = (args: { value: TinaMarkdownContent }) => JSX.Element

export const Explorer = (props: {
  value: object
  renderValue: RenderValue
  renderRichText: RenderRichText
}) => {
  return (
    <div className="font-mono">
      {/* @ts-ignore */}
      <ObjectValueRenderer {...props} />
    </div>
  )
}
const ObjectValueRenderer = (props: {
  value: object
  parentValue: object | object[]
  parentKeyName: string
  renderValue: RenderValue
  renderRichText: RenderRichText
  showMetaFields?: boolean
}) => {
  const subEntries = Object.entries(props.value).map(([keyName, subValue]) => {
    return (
      <div key={keyName} className="gap-2">
        <UnknownRenderer
          keyName={keyName}
          value={subValue}
          parentValue={props.value}
          parentKeyName={props.parentKeyName}
          renderValue={props.renderValue}
          renderRichText={props.renderRichText}
          showMetaFields={props.showMetaFields}
        />
      </div>
    )
  })
  return <div>{subEntries}</div>
}

const UnknownRenderer = ({
  keyName,
  value,
  parentValue,
  parentKeyName,
  renderValue,
  renderRichText,
  showMetaFields,
}: {
  keyName: string
  value: unknown
  parentValue: object | object[]
  parentKeyName: string
  renderValue: RenderValue
  renderRichText: RenderRichText
  showMetaFields?: boolean
}) => {
  const typeOfValue = typeof value
  const [expanded, setExpanded] = React.useState(
    /* @ts-ignore */
    value?.type === 'root' ? false : true
  )

  if (!showMetaFields) {
    if (
      [
        // 'id',
        '_sys',
        '__typename',
        // '_tina_metadata',
        '_internalValues',
        '_internalSys',
      ].includes(keyName)
    ) {
      return
    }
  }
  if (Array.isArray(value)) {
    return (
      <div>
        <button
          onClick={() => setExpanded((exp) => !exp)}
          className="min-w-[48px] flex justify-start gap-2"
        >
          {keyName}: {'['}
          {!expanded && `...]`}
        </button>
        {expanded && (
          <div className="pl-4">
            {value.map((item, index) => (
              <UnknownRenderer
                key={String(index)}
                keyName={String(index)}
                value={item}
                parentKeyName={keyName}
                parentValue={parentValue}
                renderValue={renderValue}
                renderRichText={renderRichText}
              />
            ))}
          </div>
        )}
        {expanded && <div>{']'}</div>}
      </div>
    )
  }
  if (typeOfValue === 'object') {
    /* @ts-ignore */
    if (value?.type === 'root' && renderRichText) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded((exp) => !exp)}
            className="min-w-[48px] flex justify-start gap-2"
          >
            {keyName}: {!expanded && '{...}'}
          </button>
          {/* @ts-ignore */}
          <div>
            {expanded &&
              // @ts-ignore
              renderRichText({ value, keyName, parentValue, parentKeyName })}
          </div>
        </div>
      )
    }
    return (
      <ObjectRenderer
        keyName={keyName}
        value={value}
        parentValue={parentValue}
        parentKeyName={parentKeyName}
        renderValue={renderValue}
        renderRichText={renderRichText}
      />
    )
  }
  return (
    <Value
      keyName={keyName}
      value={value}
      parentValue={parentValue}
      parentKeyName={parentKeyName}
      renderValue={renderValue}
    />
  )
}

const Value = ({
  keyName,
  value,
  parentValue,
  parentKeyName,
  renderValue,
}: {
  keyName: string
  value: unknown
  renderValue: RenderValue
  parentKeyName: string
  parentValue: object | object[]
}) => {
  const keyDisplay = isNaN(Number(keyName)) ? `${keyName}: ` : ``
  return (
    <div className="flex gap-2">
      <div>{keyDisplay}</div>
      <div>{renderValue({ value, keyName, parentValue, parentKeyName })}</div>
    </div>
  )
}

const ObjectRenderer = ({
  keyName,
  value,
  parentValue,
  parentKeyName,
  renderValue,
  renderRichText,
}) => {
  const [showMetaFields, setShowMetaFields] = React.useState(false)
  const [expanded, setExpanded] = React.useState(true)
  const v = value as object
  const keyDisplay = isNaN(Number(keyName)) ? `${keyName}: ` : ``
  if (value === null) {
    return (
      <div>
        <div className="flex gap-2">
          <div className="">{keyDisplay}</div>
          <div className="text-gray-400">null</div>
        </div>
      </div>
    )
  } else {
    const fieldName = tinaField(v)
    const extraProps = {}
    if (fieldName !== 'undefined#undefined') {
      extraProps['data-tina-field'] = fieldName
    }
    return (
      <div>
        <div className="flex justify-between">
          <button
            onClick={() => setExpanded((exp) => !exp)}
            className="min-w-[48px] flex justify-start gap-2"
          >
            {keyDisplay}
            {'{'}
            {!expanded && `...}`}
          </button>
          {expanded && (
            <button
              onClick={() => {
                setShowMetaFields((show) => !show)
              }}
              className="min-w-[48px] text-sm text-gray-400"
            >
              {showMetaFields ? 'Hide meta fields' : 'Show meta fields'}
            </button>
          )}
        </div>
        {expanded && (
          <div className="pl-4" {...extraProps}>
            <ObjectValueRenderer
              value={v}
              parentValue={parentValue}
              parentKeyName={parentKeyName}
              renderValue={renderValue}
              renderRichText={renderRichText}
              showMetaFields={showMetaFields}
            />
          </div>
        )}
        {expanded && <div>{'}'}</div>}
      </div>
    )
  }
}

export function Json(props: { src: object }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  if (!isClient) {
    return null
  }

  return (
    <Suspense fallback={<div className="">Loading...</div>}>
      <div className="px-4">
        <div className="mx-auto my-8 border rounded-lg p-8 shadow-lg max-w-5xl mx-auto shadow-lg">
          <div className="h-full overflow-scroll">
            <Explorer
              value={props.src}
              renderRichText={({
                value,
                // @ts-ignore
                keyName,
                // @ts-ignore
                parentValue,
                // @ts-ignore
                parentKeyName,
              }) => {
                let fieldName = ''
                if (!isNaN(Number(keyName))) {
                  fieldName = `${tinaField(
                    parentValue,
                    parentKeyName
                  )}.${keyName}`
                } else {
                  fieldName = tinaField(parentValue, keyName)
                }
                const extraProps = {}
                if (fieldName !== 'undefined#undefined') {
                  if (fieldName) {
                    extraProps['data-tina-field'] = fieldName
                  }
                }
                return (
                  <div
                    className="font-sans px-2 border-l-2 bg-gray-50 w-full prose"
                    {...extraProps}
                  >
                    <TinaMarkdown content={value} />
                  </div>
                )
              }}
              renderValue={({ value, keyName, parentValue, parentKeyName }) => {
                let fieldName = ''
                if (!isNaN(Number(keyName))) {
                  fieldName = `${tinaField(
                    parentValue,
                    // @ts-ignore
                    parentKeyName
                  )}.${keyName}`
                } else {
                  // @ts-ignore
                  fieldName = tinaField(parentValue, keyName)
                }
                // const dataAttributeName = tinaField(fieldName)
                const extraProps = {}
                if (fieldName !== 'undefined#undefined') {
                  if (fieldName) {
                    extraProps['data-tina-field'] = fieldName
                  }
                }
                return (
                  <span className="text-orange-600" {...extraProps}>
                    {value}
                  </span>
                )
              }}
            />
          </div>
        </div>
      </div>
    </Suspense>
  )
}
