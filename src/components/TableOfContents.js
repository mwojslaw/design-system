import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { breakpoint, color, typography } from './shared/styles';
import { Icon } from './Icon';
import { Link } from './Link';

const MENU = 'menu';
const LINK = 'link';
const BULLET_LINK = 'bullet-link';
const ITEM_TYPES = Object.freeze({
  MENU,
  LINK,
  BULLET_LINK,
});

const getItemComponent = (itemType) => {
  switch (itemType) {
    case ITEM_TYPES.MENU:
      return Menu;
    case ITEM_TYPES.LINK:
      return ItemLink;
    case ITEM_TYPES.BULLET_LINK:
      return BulletLink;
    default:
      return null;
  }
};

const StyledBulletLink = styled(({ isActive, ...rest }) => <Link {...rest} />)`
  display: inline-block;
  padding: 6px 0;
  line-height: 1.5;
  position: relative;
  z-index: 1;
  ${(props) => props.isActive && `font-weight: ${typography.weight.bold};`}

  &::after {
    position: absolute;
    top: 0px;
    right: auto;
    bottom: 0px;
    left: 3px;
    width: auto;
    height: auto;
    border-left: 1px solid ${color.mediumlight};
    content: '';
    z-index: -1;
  }
`;

const BulletLinkWrapper = styled.div`
  &:first-of-type ${StyledBulletLink} {
    margin-top: -6px;

    &::after {
      height: 50%;
      top: 50%;
    }
  }

  &:last-of-type ${StyledBulletLink} {
    margin-bottom: -6px;

    &::after {
      height: 50%;
      bottom: 50%;
    }
  }
`;

const Bullet = styled.span`
  display: inline-block;
  margin-bottom: 1px;
  margin-right: 16px;
  background: ${color.medium};
  box-shadow: white 0 0 0 4px;
  height: 8px;
  width: 8px;
  border-radius: 1em;
  text-decoration: none !important;
  content: '';
  ${(props) => props.isActive && `background: ${color.secondary};`}
`;

function BulletLink({ currentPath, item, ...rest }) {
  const isActive = currentPath === item.path;

  return (
    <BulletLinkWrapper>
      <StyledBulletLink
        isActive={isActive}
        href={item.path}
        LinkWrapper={item.LinkWrapper}
        tertiary={!isActive}
      >
        <Bullet isActive={isActive} />
        {item.title}
      </StyledBulletLink>
    </BulletLinkWrapper>
  );
}

BulletLink.propTypes = {
  currentPath: PropTypes.string.isRequired,
  item: PropTypes.shape({
    LinkWrapper: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    path: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

const TopLevelMenuToggle = styled(Link).attrs({ isButton: true, tertiary: true })`
  font-weight: ${typography.weight.bold};
  margin-bottom: 12px;
`;

const MenuLink = styled(({ isActive, ...rest }) => <Link {...rest} />)`
  color: ${(props) => (props.isActive ? color.secondary : color.darkest)};
  font-weight: ${(props) => (props.isActive ? typography.weight.bold : typography.weight.regular)};
  margin-bottom: 12px;
`;

const MenuChild = styled.div`
  margin-left: 22px;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`;

const ArrowIcon = styled(Icon).attrs({ icon: 'arrowright' })`
  width: 14px;
  width: 14px;
  color: ${color.mediumdark};
  transform: translateY(-1px) ${(props) => props.isOpen && `rotate(90deg)`};
  ${(props) => (props.isTopLevel ? `margin-right: 8px;` : `margin-left: 8px;`)}
`;

function Menu({ isTopLevel, item, setMenuOpenStateById, ...rest }) {
  if (!item.children) return null;
  const arrow = <ArrowIcon isOpen={item.isOpen} isTopLevel={isTopLevel} />;
  const MenuToggle = isTopLevel ? TopLevelMenuToggle : MenuLink;
  const openOnTab = (event) => {
    if (event.key !== 'Tab') return;
    setMenuOpenStateById({ id: item.id, isOpen: true });
  };
  const toggleOpenState = () => setMenuOpenStateById({ id: item.id, isOpen: !item.isOpen });

  return (
    <div>
      {isTopLevel && arrow}
      {isTopLevel ? (
        <TopLevelMenuToggle onClick={toggleOpenState} onKeyUp={openOnTab}>
          {item.title}
        </TopLevelMenuToggle>
      ) : (
        <MenuLink isButton onClick={toggleOpenState} onKeyUp={openOnTab}>
          {item.title}
        </MenuLink>
      )}
      {!isTopLevel && arrow}
      {item.isOpen && (
        <MenuChild>
          <Items
            items={item.children}
            isTopLevel={false}
            setMenuOpenStateById={setMenuOpenStateById}
            {...rest}
          />
        </MenuChild>
      )}
    </div>
  );
}

Menu.propTypes = {
  isTopLevel: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired, // Generated by mapItemUIState
    isOpen: PropTypes.bool.isRequired, // Generated by mapItemUIState
    title: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  setMenuOpenStateById: PropTypes.func.isRequired,
};

Menu.defaultProps = {
  isTopLevel: false,
};

function ItemLink({ currentPath, item }) {
  return (
    <div>
      <MenuLink
        isActive={currentPath === item.path}
        href={item.path}
        LinkWrapper={item.LinkWrapper}
        tertiary
      >
        {item.title}
      </MenuLink>
    </div>
  );
}

ItemLink.propTypes = {
  currentPath: PropTypes.string.isRequired,
  item: PropTypes.shape({
    path: PropTypes.string.isRequired,
    LinkWrapper: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    title: PropTypes.string.isRequired,
  }).isRequired,
};

function Items({ currentPath, items, ...rest }) {
  return (
    <>
      {items.map((item) => {
        const ItemComponent = getItemComponent(item.type);
        return <ItemComponent key={item.title} currentPath={currentPath} item={item} {...rest} />;
      })}
    </>
  );
}

Items.propTypes = {
  currentPath: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(ITEM_TYPES)).isRequired,
    }).isRequired
  ).isRequired,
};

const Section = styled.section`
  position: relative;
`;

function PureTableOfContents({ className, ...rest }) {
  return (
    <Section className={className}>
      <Items isTopLevel {...rest} />
    </Section>
  );
}

PureTableOfContents.propTypes = {
  className: PropTypes.string,
  currentPath: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(ITEM_TYPES)).isRequired,
    }).isRequired
  ).isRequired,
};

PureTableOfContents.defaultProps = {
  className: '',
};

const toKebabcase = (string) => string.toLowerCase().split(' ').join('-');

const hasActiveChildren = (args) => {
  const { children, currentPath, lastFocusedId } = args;

  return !!children.find(
    (child) =>
      child.path === currentPath ||
      child.id === lastFocusedId ||
      (child.children && hasActiveChildren({ ...args, children: child.children }))
  );
};

const getOpenState = ({
  item,
  globalItemUpdate = {},
  singleItemUpdate = {},
  lastFocusedId,
  currentPath,
  didChangeCurrentPath,
}) => {
  const withActiveChildren = hasActiveChildren({
    children: item.children,
    currentPath,
    lastFocusedId,
  });
  // If there is no 'isOpen' field yet, set a default based on whether or not
  // any of the children are active.
  if (typeof item.isOpen !== 'boolean') return withActiveChildren;
  // Path changes should open up a tree for all parents of an active item.
  if (didChangeCurrentPath && withActiveChildren) return true;

  if (typeof globalItemUpdate.isOpen === 'boolean') return globalItemUpdate.isOpen;

  if (typeof singleItemUpdate.isOpen === 'boolean' && singleItemUpdate.id === item.id)
    return singleItemUpdate.isOpen;

  return item.isOpen;
};

// Add UI state to the 'items' that are passed in as props
const mapItemUIState = (args) => {
  const {
    items,
    currentPath,
    didChangeCurrentPath,
    depth = 0,
    globalItemUpdate,
    singleItemUpdate,
    lastFocusedId,
  } = args;

  return items.map((itemWithoutId) => {
    const id = `${toKebabcase(itemWithoutId.title)}-${depth}`;
    const item = {
      ...itemWithoutId,
      id,
      // Recursively set the state of children to an infinite depth.
      // getOpenState needs the children to have an id already to determine
      // if there is a focused child, hence the placement of the recursive
      // mapItemUIState call here before getOpenState is called.
      ...(itemWithoutId.children && {
        children: mapItemUIState({ ...args, items: itemWithoutId.children, depth: depth + 1 }),
      }),
    };
    const isMenuWithChildren = item.type === ITEM_TYPES.MENU && !!item.children;

    return {
      ...item,
      // The concept of 'isOpen' only applies to menus that have children
      ...(isMenuWithChildren && {
        isOpen: getOpenState({
          item,
          globalItemUpdate,
          singleItemUpdate,
          lastFocusedId,
          currentPath,
          didChangeCurrentPath,
        }),
      }),
    };
  });
};

export function TableOfContents({ children, currentPath, items, ...rest }) {
  const [lastFocusedId, setLastFocusedId] = useState(undefined);
  const mapItemUIStateCommonArgs = { currentPath, lastFocusedId };
  const [itemsWithUIState, setItemsWithUIState] = useState(
    mapItemUIState({ items, currentPath, lastFocusedId })
  );
  const toggleAllOpenStates = (isOpen) =>
    setItemsWithUIState(
      mapItemUIState({
        ...mapItemUIStateCommonArgs,
        items: itemsWithUIState,
        globalItemUpdate: { isOpen },
      })
    );
  const toggleAllOpen = () => toggleAllOpenStates(true);
  const toggleAllClosed = () => toggleAllOpenStates(false);
  const setMenuOpenStateById = (args) =>
    setItemsWithUIState(
      mapItemUIState({
        ...mapItemUIStateCommonArgs,
        items: itemsWithUIState,
        singleItemUpdate: args,
      })
    );

  const didRunCurrentPathEffectOnMount = useRef(false);
  useEffect(() => {
    if (didRunCurrentPathEffectOnMount.current) {
      setItemsWithUIState(
        mapItemUIState({
          ...mapItemUIStateCommonArgs,
          didChangeCurrentPath: true,
          items: itemsWithUIState,
        })
      );
    } else {
      didRunCurrentPathEffectOnMount.current = true;
    }
  }, [currentPath]);

  const tableOfContentsMenu = (
    <PureTableOfContents
      currentPath={currentPath}
      items={itemsWithUIState}
      setMenuOpenStateById={setMenuOpenStateById}
      setLastFocusedId={setLastFocusedId}
      {...rest}
    />
  );

  return typeof children === 'function'
    ? children({ menu: tableOfContentsMenu, toggleAllOpen, toggleAllClosed })
    : tableOfContentsMenu;
}

TableOfContents.propTypes = {
  children: PropTypes.func,
  currentPath: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(ITEM_TYPES)).isRequired,
    }).isRequired
  ).isRequired,
};

TableOfContents.defaultProps = {
  children: undefined,
};
