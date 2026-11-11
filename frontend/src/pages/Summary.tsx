import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  FileText,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const mockSummary = {
  title: 'Quantum Physics - Wave-Particle Duality',
  generatedAt: '2024-12-14',
  content: `# Wave-Particle Duality

## Overview
Wave-particle duality is a fundamental concept in quantum mechanics that describes how every particle or quantum entity may be described as either a particle or a wave.

## Key Concepts

### 1. Dual Nature of Light
- Light exhibits both wave-like and particle-like properties
- Depends on the experimental setup and observation method
- Cannot be fully explained by classical physics alone

### 2. De Broglie Wavelength
The wavelength λ associated with a particle is given by:

λ = h / p

Where:
- h is Planck's constant
- p is the momentum of the particle

### 3. Double-Slit Experiment
- Demonstrates wave-particle duality most clearly
- When not observed: interference pattern (wave behavior)
- When observed: particle-like behavior
- Shows the role of measurement in quantum mechanics

## Important Formulas

1. Energy-frequency relation: E = hν
2. Momentum-wavelength: p = h/λ
3. Heisenberg uncertainty principle: ΔxΔp ≥ ℏ/2

## Applications
- Electron microscopy
- Quantum computing
- Semiconductor technology
- Photovoltaic cells

## Summary
Wave-particle duality challenges our classical understanding of nature and forms the foundation for modern quantum mechanics. It demonstrates that quantum entities don't fit neatly into classical categories and require a new framework for understanding.`
};

export default function Summary() {
  const { courseId } = useParams();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mockSummary.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 z-40 bg-background">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate('/@me/content')}
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Library
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate(`/@me/content/${courseId}`)}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  Quantum Physics
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-primary">Summary</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="heading-1 mb-2">
                {mockSummary.title}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Generated on {mockSummary.generatedAt}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Summary Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                {mockSummary.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
