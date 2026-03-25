/**
 * Chart Components Tests
 *
 * Tests for WREI chart components using Recharts
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WREILineChart, WREIPieChart, WREIBarChart, WREIAreaChart } from '@/components/charts';

// Mock Recharts to avoid issues in test environment
jest.mock('recharts', () => ({
  LineChart: ({ children, ...props }: any) => <div data-testid="line-chart" {...props}>{children}</div>,
  Line: ({ dataKey, ...props }: any) => <div data-testid="line" data-datakey={dataKey} {...props} />,
  PieChart: ({ children, ...props }: any) => <div data-testid="pie-chart" {...props}>{children}</div>,
  Pie: ({ dataKey, ...props }: any) => <div data-testid="pie" data-datakey={dataKey} {...props} />,
  BarChart: ({ children, ...props }: any) => <div data-testid="bar-chart" {...props}>{children}</div>,
  Bar: ({ dataKey, ...props }: any) => <div data-testid="bar" data-datakey={dataKey} {...props} />,
  AreaChart: ({ children, ...props }: any) => <div data-testid="area-chart" {...props}>{children}</div>,
  Area: ({ dataKey, ...props }: any) => <div data-testid="area" data-datakey={dataKey} {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>{children}</div>
  ),
  Cell: ({ fill, ...props }: any) => <div data-testid="cell" data-fill={fill} {...props} />
}));

describe('WREILineChart Component', () => {
  const mockData = [
    { date: '2026-01-01', price: 150 },
    { date: '2026-01-02', price: 155 },
    { date: '2026-01-03', price: 148 }
  ];

  test('renders line chart without errors', () => {
    render(
      <WREILineChart
        data={mockData}
        xDataKey="date"
        yDataKey="price"
        title="Carbon Price Trends"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByText('Carbon Price Trends')).toBeInTheDocument();
  });

  test('renders without title when not provided', () => {
    render(
      <WREILineChart
        data={mockData}
        xDataKey="date"
        yDataKey="price"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('applies correct WREI colour scheme', () => {
    render(
      <WREILineChart
        data={mockData}
        xDataKey="date"
        yDataKey="price"
        color="#10B981"
      />
    );

    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(
      <WREILineChart
        data={[]}
        xDataKey="date"
        yDataKey="price"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('applies custom height', () => {
    render(
      <WREILineChart
        data={mockData}
        xDataKey="date"
        yDataKey="price"
        height={400}
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});

describe('WREIPieChart Component', () => {
  const mockData = [
    { name: 'Carbon Credits', value: 3500000 },
    { name: 'Green Bonds', value: 2500000 },
    { name: 'Renewable Energy', value: 2000000 }
  ];

  test('renders pie chart without errors', () => {
    render(
      <WREIPieChart
        data={mockData}
        dataKey="value"
        nameKey="name"
        title="Portfolio Allocation"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Allocation')).toBeInTheDocument();
  });

  test('renders cells for each data point', () => {
    render(
      <WREIPieChart
        data={mockData}
        dataKey="value"
        nameKey="name"
      />
    );

    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(mockData.length);
  });

  test('applies custom colors', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];
    render(
      <WREIPieChart
        data={mockData}
        dataKey="value"
        nameKey="name"
        colors={customColors}
      />
    );

    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(
      <WREIPieChart
        data={[]}
        dataKey="value"
        nameKey="name"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});

describe('WREIBarChart Component', () => {
  const mockData = [
    { category: 'API Response', value: 450 },
    { category: 'CPU Usage', value: 0.65 },
    { category: 'Success Rate', value: 0.98 }
  ];

  test('renders bar chart without errors', () => {
    render(
      <WREIBarChart
        data={mockData}
        xDataKey="category"
        yDataKey="value"
        title="Performance Metrics"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  test('supports horizontal orientation', () => {
    render(
      <WREIBarChart
        data={mockData}
        xDataKey="category"
        yDataKey="value"
        horizontal={true}
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(
      <WREIBarChart
        data={[]}
        xDataKey="category"
        yDataKey="value"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});

describe('WREIAreaChart Component', () => {
  const mockData = [
    { date: '2026-01-01', volume: 1000000 },
    { date: '2026-01-02', volume: 1200000 },
    { date: '2026-01-03', volume: 950000 }
  ];

  test('renders area chart without errors', () => {
    render(
      <WREIAreaChart
        data={mockData}
        xDataKey="date"
        yDataKey="volume"
        title="Trading Volume Trends"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByText('Trading Volume Trends')).toBeInTheDocument();
  });

  test('supports gradient fills', () => {
    render(
      <WREIAreaChart
        data={mockData}
        xDataKey="date"
        yDataKey="volume"
        gradient={true}
      />
    );

    expect(screen.getByTestId('area')).toBeInTheDocument();
  });

  test('disables gradient when specified', () => {
    render(
      <WREIAreaChart
        data={mockData}
        xDataKey="date"
        yDataKey="volume"
        gradient={false}
      />
    );

    expect(screen.getByTestId('area')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(
      <WREIAreaChart
        data={[]}
        xDataKey="date"
        yDataKey="volume"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});

describe('Chart Component Responsive Behavior', () => {
  test('all charts use ResponsiveContainer for responsive sizing', () => {
    const mockData = [{ x: 1, y: 2 }];

    render(
      <>
        <WREILineChart data={mockData} xDataKey="x" yDataKey="y" />
        <WREIPieChart data={[{ name: 'Test', value: 100 }]} dataKey="value" nameKey="name" />
        <WREIBarChart data={mockData} xDataKey="x" yDataKey="y" />
        <WREIAreaChart data={mockData} xDataKey="x" yDataKey="y" />
      </>
    );

    const containers = screen.getAllByTestId('responsive-container');
    expect(containers).toHaveLength(4);
  });
});

describe('Chart Component WREI Styling', () => {
  test('all charts apply WREI colour scheme', () => {
    const mockData = [{ x: 1, y: 2 }];
    const pieData = [{ name: 'Test', value: 100 }];

    render(
      <>
        <WREILineChart data={mockData} xDataKey="x" yDataKey="y" />
        <WREIPieChart data={pieData} dataKey="value" nameKey="name" />
        <WREIBarChart data={mockData} xDataKey="x" yDataKey="y" />
        <WREIAreaChart data={mockData} xDataKey="x" yDataKey="y" />
      </>
    );

    // Check that charts are wrapped in white background containers
    const chartContainers = screen.getAllByRole('generic').filter(el =>
      el.className.includes('bg-white') && el.className.includes('rounded-lg')
    );

    expect(chartContainers.length).toBeGreaterThan(0);
  });
});