import React from 'react'
import { CTA, Page } from '../components.jsx'
export function NotFound(){return <Page kicker="404" title="That module is not in the graph." intro="The route does not exist or has moved."><CTA to="/">Return to index</CTA></Page>}
