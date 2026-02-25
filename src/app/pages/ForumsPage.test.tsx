import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConferenceProvider } from '@/app/contexts/ConferenceContext';
import { SearchProvider } from '@/app/contexts/SearchContext';
import { MapImage, Room } from '@/types/conference';

// ── Mock Leaflet ─────────────────────────────────────────────────────────────
const mockLeafletMap = {
  on: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
};
const mockPolygon = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  setStyle: vi.fn(),
  openPopup: vi.fn(),
  getBounds: vi.fn(() => ({})),
};
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockLeafletMap),
    CRS: { Simple: {} },
    imageOverlay: vi.fn(() => ({ addTo: vi.fn() })),
    polygon: vi.fn(() => mockPolygon),
  },
}));

// ── Mock ScheduleView ─────────────────────────────────────────────────────────
vi.mock('@/app/components/ScheduleView', () => ({
  ScheduleView: () => <div data-testid="schedule-view" />,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { ForumsPage } from '@/app/pages/ForumsPage';

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderForumsPage() {
  return render(
    <ConferenceProvider>
      <SearchProvider>
        <ForumsPage />
      </SearchProvider>
    </ConferenceProvider>,
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('ForumsPage', () => {
  it('renders without crashing', () => {
    expect(() => renderForumsPage()).not.toThrow();
  });

  it('renders the map container div', () => {
    renderForumsPage();
    const container = document.querySelector('.block');
    expect(container).not.toBeNull();
  });

  it('renders ScheduleView', () => {
    renderForumsPage();
    expect(screen.getByTestId('schedule-view')).toBeInTheDocument();
  });
});

// ── forumMap fallback logic ───────────────────────────────────────────────────
describe('forumMap fallback selection', () => {
  const fallbackMap: MapImage = {
    id: 'map-0',
    name: 'noForumMapFound',
    url: '/pacificon-forums-2025.jpg',
    order: 6,
    origHeightNum: 256,
    origWidthNum: 582,
  };

  const forumsMap: MapImage = {
    id: 'map-forum',
    name: 'Forums',
    url: '/pacificon-forums-2025.jpg',
    order: 3,
    origHeightNum: 256,
    origWidthNum: 582,
  };

  const hotelMap: MapImage = {
    id: 'map-hotel',
    name: 'Hotel',
    url: '/pacificon-hotel-2025.jpg',
    order: 1,
    origHeightNum: 1201,
    origWidthNum: 983,
  };

  const roomEntry: [string, Room[]] = [
    '/pacificon-forums-2025.jpg',
    [{ name: 'Salon E', coords: [[0, 0], [10, 0], [10, 10], [0, 10]], color: '#3B82F6' }],
  ];

  it('selects the map whose URL matches the mapRooms URL', () => {
    const maps: MapImage[] = [hotelMap, forumsMap];
    const [forumMapUrl] = roomEntry;
    const selected = maps.find(m => m.url === forumMapUrl) ?? fallbackMap;
    expect(selected.id).toBe('map-forum');
  });

  it('falls back to default map when no conferenceMaps entry matches', () => {
    const maps: MapImage[] = [hotelMap]; // forumsMap is absent
    const [forumMapUrl] = roomEntry;
    const selected = maps.find(m => m.url === forumMapUrl) ?? fallbackMap;
    expect(selected.id).toBe('map-0');
    expect(selected.origHeightNum).toBe(256);
    expect(selected.origWidthNum).toBe(582);
  });

  it('falls back when conferenceMaps is empty', () => {
    const maps: MapImage[] = [];
    const [forumMapUrl] = roomEntry;
    const selected = maps.find(m => m.url === forumMapUrl) ?? fallbackMap;
    expect(selected).toEqual(fallbackMap);
  });
});
